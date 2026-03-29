const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Members
export const getMembers   = ()           => req('GET',    '/api/members');
export const createMember = (name)       => req('POST',   '/api/members',      { name });
export const updateMember = (id, name)   => req('PUT',    `/api/members/${id}`,{ name });
export const deleteMember = (id)         => req('DELETE', `/api/members/${id}`);

// Ministries
export const getMinistries  = ()                    => req('GET',    '/api/ministries');
export const createMinistry = (name, icon, limit)   => req('POST',   '/api/ministries',       { name, icon, limit });
export const updateMinistry = (id, name, icon, limit) => req('PUT',  `/api/ministries/${id}`, { name, icon, limit });
export const deleteMinistry = (id)                  => req('DELETE', `/api/ministries/${id}`);

// Interests
export const getInterests   = ()                     => req('GET',  '/api/interests');
export const toggleInterest = (memberId, ministryId) => req('POST', '/api/interests/toggle', { memberId, ministryId });

// Rosters
export const getRosters      = ()           => req('GET',   '/api/rosters');
export const getLatestRoster = ()           => req('GET',   '/api/rosters/latest/current');
export const generateRoster  = (date)       => req('POST',  '/api/rosters/generate', { date });
export const addMember       = (id, ministryId, memberId) => req('PATCH', `/api/rosters/${id}/add-member`,    { ministryId, memberId });
export const removeMember    = (id, ministryId, memberId) => req('PATCH', `/api/rosters/${id}/remove-member`, { ministryId, memberId });
export const confirmRoster   = (id)         => req('PATCH', `/api/rosters/${id}/confirm`);
export const deleteRoster    = (id)         => req('DELETE', `/api/rosters/${id}`);
