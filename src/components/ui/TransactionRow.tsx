import { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import CardChip from './CardChip'

interface TransactionRowProps {
  tx: Transaction
}

export default function TransactionRow({ tx }: TransactionRowProps) {
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-[#0D0D0D]/6 last:border-0">
      {/* 類別圓點 */}
      <div className="w-9 h-9 rounded-full bg-[#0D0D0D]/5 flex items-center justify-center flex-shrink-0">
        <span className="text-xs text-[#0D0D0D]/40">{tx.category[0]}</span>
      </div>

      {/* 中間資訊 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-[#0D0D0D] truncate">{tx.merchant}</span>
          <CardChip cardId={tx.card_id} size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#0D0D0D]/35">{tx.category}</span>
          <span className="text-[11px] text-[#0D0D0D]/25">·</span>
          <span className="text-[11px] text-[#0D0D0D]/35">{formatDate(tx.transaction_date)}</span>
        </div>
      </div>

      {/* 金額 */}
      <span className="font-number text-base font-normal text-[#0D0D0D] flex-shrink-0">
        -{formatCurrency(tx.amount)}
      </span>
    </div>
  )
}
