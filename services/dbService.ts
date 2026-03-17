import { supabase } from '../lib/supabase';
import type { User, AuditInfo, IsoStandard, CompletedAudit } from '../types';
import { ISO_STANDARDS } from '../constants';

export const dbService = {
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) { console.error('Error fetching users:', error); return []; }
    return data as User[];
  },
  async addUser(user: User) {
    const { error } = await supabase.from('users').insert([user]);
    if (error) console.error('Error adding user:', error);
  },
  async updateUser(user: User) {
    const { error } = await supabase.from('users').update(user).eq('id', user.id);
    if (error) console.error('Error updating user:', error);
  },
  async deleteUser(id: string) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) console.error('Error deleting user:', error);
  },
  async getAuditInfo(): Promise<AuditInfo | null> {
    const { data, error } = await supabase.from('audit_info').select('*').eq('id', 1).single();
    if (error) { console.error('Error fetching audit info:', error); return null; }
    return data as AuditInfo;
  },
  async updateAuditInfo(info: AuditInfo) {
    const { error } = await supabase.from('audit_info').upsert({ id: 1, ...info });
    if (error) console.error('Error updating audit info:', error);
  },
  async getStandards(): Promise<IsoStandard[]> {
    const { data, error } = await supabase.from('standards').select('*');
    if (error || !data || data.length === 0) {
       return JSON.parse(JSON.stringify(ISO_STANDARDS));
    }
    return data as IsoStandard[];
  },
  async updateStandard(standard: IsoStandard) {
    const { error } = await supabase.from('standards').upsert({
      id: standard.id,
      name: standard.name,
      items: standard.items
    });
    if (error) console.error('Error updating standard:', error);
  },
  async resetStandards() {
    const defaultStandards = JSON.parse(JSON.stringify(ISO_STANDARDS));
    for (const s of defaultStandards) {
       await this.updateStandard(s);
    }
    return defaultStandards;
  },
  async getCompletedAudits(): Promise<CompletedAudit[]> {
    const { data, error } = await supabase.from('completed_audits').select('*');
    if (error) { console.error('Error fetching completed audits:', error); return []; }
    return data as CompletedAudit[];
  },
  async addCompletedAudit(audit: CompletedAudit) {
    const { error } = await supabase.from('completed_audits').insert([audit]);
    if (error) console.error('Error adding completed audit:', error);
  }
};
