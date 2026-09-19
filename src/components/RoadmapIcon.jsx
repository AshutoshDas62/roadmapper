import { BookOpen, BriefcaseBusiness, Code2, Compass, GraduationCap, Map, Palette } from 'lucide-react'

export function RoadmapIcon({ name, size = 20, className }) {
  const props = { size, className, 'aria-hidden': true }
  switch (name) {
    case 'code': return <Code2 {...props} />
    case 'design': return <Palette {...props} />
    case 'career': return <BriefcaseBusiness {...props} />
    case 'learning': return <GraduationCap {...props} />
    case 'book': return <BookOpen {...props} />
    case 'compass': return <Compass {...props} />
    default: return <Map {...props} />
  }
}
