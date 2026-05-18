import { CardId, CARDS } from '@/types'
import { cn } from '@/lib/utils'

interface CardChipProps {
  cardId: CardId
  size?: 'sm' | 'md'
}

export default function CardChip({ cardId, size = 'md' }: CardChipProps) {
  const card = CARDS.find((c) => c.id === cardId)
  if (!card) return null

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full tracking-wide',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'
      )}
      style={{ backgroundColor: card.color, color: card.textColor }}
    >
      {card.name}
    </span>
  )
}
