import { useCallback, useEffect, useState } from 'react'
import { addEdge, Background, Controls, MarkerType, MiniMap, Panel, ReactFlow, useEdgesState, useNodesState } from 'reactflow'
import 'reactflow/dist/style.css'
import { Link2Off, Maximize2, Plus, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react'
import { TopicForm } from './TopicForm'
import { TopicNode } from './TopicNode'
import { createTopic, createTopicEdge, deleteTopic, deleteTopicEdge, updateTopic } from '../lib/topics'
import { supabase } from '../lib/supabase'

const nodeTypes = { topic: TopicNode }

function toFlowEdge(edge) {
  return {
    id: edge.id,
    source: edge.source_topic_id,
    target: edge.target_topic_id,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
    style: { stroke: '#818cf8', strokeWidth: 2 },
  }
}

export function RoadmapEditor({ roadmapId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [editorError, setEditorError] = useState('')
  const [dialog, setDialog] = useState(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState('')
  const [flowInstance, setFlowInstance] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  const openCreateTopic = useCallback((parentTopic = null) => {
    setDialog({ type: 'create', parentTopic })
  }, [])

  const openEditTopic = useCallback((topic) => {
    setDialog({ type: 'edit', topic, parentTopic: null })
  }, [])

  const removeTopic = useCallback(async (topic) => {
    if (!window.confirm(`Delete "${topic.title}" and its connections? This cannot be undone.`)) return
    setEditorError('')
    const { error } = await deleteTopic(topic.id)
    if (error) {
      setEditorError(error.message || 'We could not delete this topic.')
      return
    }
    setNodes((current) => current.filter((node) => node.id !== topic.id))
    setEdges((current) => current.filter((edge) => edge.source !== topic.id && edge.target !== topic.id))
    setSelectedEdgeId('')
  }, [setEdges, setNodes])

  const toFlowNode = useCallback((topic) => ({
    id: topic.id,
    type: 'topic',
    position: { x: topic.position_x, y: topic.position_y },
    data: { topic, onEdit: openEditTopic, onAddSubtopic: openCreateTopic, onDelete: removeTopic },
  }), [openCreateTopic, openEditTopic, removeTopic])

  useEffect(() => {
    let isMounted = true
    async function loadEditor() {
      setIsLoading(true)
      setLoadError('')
      const [topicsResult, edgesResult] = await Promise.all([
        supabase.from('roadmap_topics').select('id, roadmap_id, parent_id, title, description, status, position_x, position_y, created_at, updated_at').eq('roadmap_id', roadmapId).order('created_at'),
        supabase.from('roadmap_edges').select('id, roadmap_id, source_topic_id, target_topic_id, created_at').eq('roadmap_id', roadmapId).order('created_at'),
      ])
      if (!isMounted) return
      if (topicsResult.error || edgesResult.error) {
        setLoadError(topicsResult.error?.message || edgesResult.error?.message || 'We could not load this roadmap editor.')
        setNodes([])
        setEdges([])
      } else {
        setNodes(topicsResult.data.map(toFlowNode))
        setEdges(edgesResult.data.map(toFlowEdge))
      }
      setIsLoading(false)
    }
    loadEditor()
    return () => { isMounted = false }
  }, [roadmapId, reloadToken, setEdges, setNodes, toFlowNode])

  async function saveTopic(values) {
    if (dialog.type === 'edit') {
      const { data, error } = await updateTopic(dialog.topic.id, values)
      if (error) throw error
      setNodes((current) => current.map((node) => node.id === data.id ? toFlowNode(data) : node))
    } else {
      const parentNode = dialog.parentTopic ? nodes.find((node) => node.id === dialog.parentTopic.id) : null
      const offset = nodes.length % 5
      const position = parentNode
        ? { x: parentNode.position.x + 290, y: parentNode.position.y + 80 }
        : { x: 80 + offset * 35, y: 80 + offset * 35 }
      const { data, error } = await createTopic({
        roadmap_id: roadmapId,
        parent_id: dialog.parentTopic?.id || null,
        ...values,
        position_x: position.x,
        position_y: position.y,
      })
      if (error) throw error
      setNodes((current) => [...current, toFlowNode(data)])
    }
    setDialog(null)
  }

  async function handleConnect(connection) {
    if (!connection.source || !connection.target || connection.source === connection.target) return
    if (edges.some((edge) => edge.source === connection.source && edge.target === connection.target)) {
      setEditorError('Those topics are already connected.')
      return
    }
    setEditorError('')
    const { data, error } = await createTopicEdge({
      roadmap_id: roadmapId,
      source_topic_id: connection.source,
      target_topic_id: connection.target,
    })
    if (error) {
      setEditorError(error.message || 'We could not save this connection.')
      return
    }
    setEdges((current) => addEdge(toFlowEdge(data), current))
  }

  async function handleNodeDragStop(_event, node) {
    const { error } = await updateTopic(node.id, { position_x: node.position.x, position_y: node.position.y })
    if (error) setEditorError(error.message || 'We could not save that topic position.')
  }

  async function removeSelectedEdge() {
    if (!selectedEdgeId) return
    setEditorError('')
    const { error } = await deleteTopicEdge(selectedEdgeId)
    if (error) {
      setEditorError(error.message || 'We could not remove this connection.')
      return
    }
    setEdges((current) => current.filter((edge) => edge.id !== selectedEdgeId))
    setSelectedEdgeId('')
  }

  if (isLoading) {
    return <section className="mt-8"><div className="mb-3 h-6 w-44 animate-pulse rounded bg-slate-200" /><div className="h-[560px] animate-pulse rounded-2xl border border-slate-200 bg-white" /></section>
  }

  if (loadError) {
    return <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="font-semibold text-amber-900">We could not load the visual editor.</h2><p className="mt-1 text-sm text-amber-800">{loadError}</p><button type="button" onClick={() => setReloadToken((token) => token + 1)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-amber-900 shadow-sm"><RefreshCw size={16} aria-hidden="true" /> Try again</button></section>
  }

  if (nodes.length === 0) {
    return <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><h2 className="text-xl font-bold text-slate-900">Start your visual roadmap</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Add your first topic, then drag it into place and connect it to the next step in your learning path.</p><button type="button" onClick={() => openCreateTopic()} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"><Plus size={17} aria-hidden="true" /> Add first topic</button>{dialog && <TopicForm key="first-topic" parentTopic={dialog.parentTopic} onSave={saveTopic} onCancel={() => setDialog(null)} />}</section>
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold text-slate-900">Visual roadmap</h2><p className="mt-1 text-sm text-slate-600">Drag topics to organize them. Drag between the handles to create a connection.</p></div><button type="button" onClick={() => openCreateTopic()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"><Plus size={17} aria-hidden="true" /> Add topic</button></div>
      {editorError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{editorError}</p>}
      <div className="h-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white sm:h-[650px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onNodeDragStop={handleNodeDragStop}
          onEdgeClick={(_event, edge) => setSelectedEdgeId(edge.id)}
          onInit={setFlowInstance}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          deleteKeyCode={null}
          defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#818cf8', strokeWidth: 2 } }}
          className="bg-slate-50"
        >
          <Background color="#cbd5e1" gap={20} size={1} />
          <MiniMap nodeColor="#c7d2fe" maskColor="rgba(248, 250, 252, 0.75)" />
          <Controls />
          <Panel position="top-left" className="!m-3 flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm"><button type="button" onClick={() => flowInstance?.zoomIn()} className="rounded p-2 text-slate-600 hover:bg-slate-100" aria-label="Zoom in"><ZoomIn size={16} aria-hidden="true" /></button><button type="button" onClick={() => flowInstance?.zoomOut()} className="rounded p-2 text-slate-600 hover:bg-slate-100" aria-label="Zoom out"><ZoomOut size={16} aria-hidden="true" /></button><button type="button" onClick={() => flowInstance?.fitView({ padding: 0.25 })} className="rounded p-2 text-slate-600 hover:bg-slate-100" aria-label="Fit roadmap to screen"><Maximize2 size={16} aria-hidden="true" /></button></Panel>
          {selectedEdgeId && <Panel position="top-right" className="!m-3"><button type="button" onClick={removeSelectedEdge} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm hover:bg-red-50"><Link2Off size={15} aria-hidden="true" /> Remove connection</button></Panel>}
        </ReactFlow>
      </div>
      {dialog && <TopicForm key={`${dialog.type}-${dialog.topic?.id || dialog.parentTopic?.id || 'root'}`} topic={dialog.topic} parentTopic={dialog.parentTopic} onSave={saveTopic} onCancel={() => setDialog(null)} />}
    </section>
  )
}
