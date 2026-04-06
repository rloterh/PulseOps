import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import { loadProfileLabelMap } from '@/lib/data/load-label-maps';

export interface MemberOption {
  id: string;
  label: string;
  role: string;
}

export async function getMemberOptions(organizationId: string): Promise<MemberOption[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('organization_members')
    .select('user_id, role')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const profileLabels = await loadProfileLabelMap(
    supabase,
    data.map((member) => member.user_id),
  );

  return data.map((member) => {
    return {
      id: member.user_id,
      label: profileLabels.get(member.user_id) ?? 'Unknown operator',
      role: member.role,
    };
  });
}
