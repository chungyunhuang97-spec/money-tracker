'use client'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function AmountInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
}: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // 只允許數字，最多一個小數點，小數點後最多 2 位
    const cleaned = raw
      .replace(/[^0-9.]/g, '')           // 去掉非數字非小數點
      .replace(/(\..*)\./g, '$1')         // 只保留第一個小數點
      .replace(/(\.\d{2})\d+/g, '$1')    // 小數點後最多 2 位
    onChange(cleaned)
  }

  return (
    <input
      inputMode="decimal"          // iOS/Android 彈出數字鍵盤（含小數點）
      type="text"                  // 用 text 而非 number，避免瀏覽器自帶箭頭和奇怪行為
      pattern="[0-9]*\.?[0-9]{0,2}"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  )
}
