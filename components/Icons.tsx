'use client'
import {
  House, UsersThree, PencilSimpleLine, UserCircle, Fire, Sparkle, Trophy,
  ChatCircle, ArrowFatUp, ArrowFatDown, Mountains, SoccerBall, ChartLineUp,
  Wrench, Palette, CaretRight
} from '@phosphor-icons/react'

type IconProps = { size?: number; color?: string; active?: boolean }

function w(active?: boolean) {
  return active ? 'fill' : 'duotone'
}

export function HomeIcon({ size = 24, color = 'currentColor', active }: IconProps) {
  return <House size={size} color={color} weight={w(active)} aria-hidden='true' />
}

export function CommunitiesIcon({ size = 24, color = 'currentColor', active }: IconProps) {
  return <UsersThree size={size} color={color} weight={w(active)} aria-hidden='true' />
}

export function PostIcon({ size = 24, color = 'currentColor', active }: IconProps) {
  return <PencilSimpleLine size={size} color={color} weight={w(active)} aria-hidden='true' />
}

export function ProfileIcon({ size = 24, color = 'currentColor', active }: IconProps) {
  return <UserCircle size={size} color={color} weight={w(active)} aria-hidden='true' />
}

export function HotIcon({ size = 18, color = 'currentColor', active }: IconProps) {
  return <Fire size={size} color={color} weight={w(active)} aria-hidden='true' />
}

export function NewIcon({ size = 18, color = 'currentColor', active }: IconProps) {
  return <Sparkle size={size} color={color} weight={w(active)} aria-hidden='true' />
}

export function TopIcon({ size = 18, color = 'currentColor', active }: IconProps) {
  return <Trophy size={size} color={color} weight={w(active)} aria-hidden='true' />
}

export function CommentIcon({ size = 16, color = 'currentColor', active }: IconProps) {
  return <ChatCircle size={size} color={color} weight={w(active)} aria-hidden='true' />
}

export function UpIcon({ size = 20, color = 'currentColor', active }: IconProps) {
  return <ArrowFatUp size={size} color={color} weight={active ? 'fill' : 'regular'} aria-hidden='true' />
}

export function DownIcon({ size = 20, color = 'currentColor', active }: IconProps) {
  return <ArrowFatDown size={size} color={color} weight={active ? 'fill' : 'regular'} aria-hidden='true' />
}

export function OutdoorsIcon({ size = 26, color = 'currentColor' }: IconProps) {
  return <Mountains size={size} color={color} weight='duotone' aria-hidden='true' />
}

export function SportsIcon({ size = 26, color = 'currentColor' }: IconProps) {
  return <SoccerBall size={size} color={color} weight='duotone' aria-hidden='true' />
}

export function MoneyIcon({ size = 26, color = 'currentColor' }: IconProps) {
  return <ChartLineUp size={size} color={color} weight='duotone' aria-hidden='true' />
}

export function GarageIcon({ size = 26, color = 'currentColor' }: IconProps) {
  return <Wrench size={size} color={color} weight='duotone' aria-hidden='true' />
}

export function ArtIcon({ size = 26, color = 'currentColor' }: IconProps) {
  return <Palette size={size} color={color} weight='duotone' aria-hidden='true' />
}

export function ChevronIcon({ size = 18, color = 'currentColor' }: IconProps) {
  return <CaretRight size={size} color={color} weight='bold' aria-hidden='true' />
}

export function CommunityIcon({ slug, ...p }: IconProps & { slug: string }) {
  if (slug === 'outdoors') return <OutdoorsIcon {...p} />
  if (slug === 'sports') return <SportsIcon {...p} />
  if (slug === 'money-building') return <MoneyIcon {...p} />
  if (slug === 'garage') return <GarageIcon {...p} />
  if (slug === 'art-makers') return <ArtIcon {...p} />
  return <CommunitiesIcon {...p} />
}