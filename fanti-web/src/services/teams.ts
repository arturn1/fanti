import { Team } from '@/types';

export async function getTeams(): Promise<Team[]> {
  const res = await fetch('/api/teams');
  if (!res.ok) throw new Error('Erro ao buscar equipes');
  const data = await res.json();
  return data?.data || [];
}
