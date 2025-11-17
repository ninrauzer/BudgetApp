import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface ChartCardProps {
  id: string;
  children: React.ReactNode;
}

export default function ChartCard({ id, children }: ChartCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white/80 hover:bg-white shadow-sm cursor-grab active:cursor-grabbing transition-colors"
        title="Arrastra para reordenar"
      >
        <GripVertical className="w-5 h-5 text-gray-500" />
      </div>
      
      {children}
    </div>
  );
}
