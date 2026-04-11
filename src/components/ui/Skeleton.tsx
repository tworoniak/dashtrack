import type { CSSProperties } from 'react'
import styles from './Skeleton.module.scss'

interface Props {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
  style?: CSSProperties
}

export default function Skeleton({ width = '100%', height = 16, borderRadius = 6, className, style }: Props) {
  return (
    <div
      className={`${styles.skeleton} ${className ?? ''}`}
      style={{ width, height, borderRadius, ...style }}
      aria-hidden="true"
    />
  )
}
