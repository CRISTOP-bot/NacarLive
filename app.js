'use strict';
const repositories = [
  { name: 'Nácar GNU/Linux', owner: 'CRISTOP-bot', repo: 'nacar-linux', subtitle: 'Debian + OpenRC', icon: 'N' },
  { name: 'DylanOS', owner: 'CRISTOP-bot', repo: 'DylanOS', subtitle: 'Debian Stable + KDE Plasma', icon: 'D' }
];
const $ = (id) => document.getElementById(id);
const api = 'https://api.github.com';
const date = (value) => value ? new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : 'fecha no disponible';
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]); }
function safeGithubUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === 'github.com' ? url.href : '#'; } catch { return '#'; } }
async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(response.status === 403 ? 'GitHub limitó temporalmente las consultas.' : `GitHub respondió HTTP ${response.status}.`);
  return response.json();
}
function runStatus(run) {
  if (!run) return { label: 'Sin ejecuciones visibles', state: 'neutral', detail: 'No encontramos workflows recientes o el repositorio no expone ejecuciones.' };
  if (run.status !== 'completed') return { label: 'Ejecución en curso', state: 'running', detail: `${run.name || run.display_title} · ${run.status} · ${date(run.updated_at)}` };
  if (run.conclusion === 'success') return { label: 'Último workflow exitoso', state: 'success', detail: `${run.name || run.display_title} · ${date(run.updated_at)}` };
  if (run.conclusion === 'failure' || run.conclusion === 'timed_out' || run.conclusion === 'cancelled') return { label: 'Último workflow no pasó', state: 'failure', detail: `${run.name || run.display_title} · ${run.conclusion} · ${date(run.updated_at)}` };
  return { label: `Workflow: ${run.conclusion || run.status}`, state: 'neutral', detail: `${run.name || run.display_title} · ${date(run.updated_at)}` };
}
function renderCard(repo, data) {
  const repoUrl = `https://github.com/${repo.owner}/${repo.repo}`;
  const run = runStatus(data.run);
  const release = data.release;
  return `<article class="project-card">
    <div class="card-head"><div class="repo-title"><span class="repo-icon">${repo.icon}</span><div><h2>${escapeHtml(repo.name)}</h2><a href="${repoUrl}" target="_blank" rel="noreferrer">${repo.owner}/${repo.repo}</a></div></div><span class="repo-badge">${escapeHtml(repo.subtitle)}</span></div>
    <div class="divider"></div><p class="section-label">BUILD / WORKFLOW RECIENTE</p>
    <div class="run-row"><i class="status-icon ${run.state}"></i><div><div class="run-title">${escapeHtml(run.label)}</div><div class="run-meta">${escapeHtml(run.detail)}</div>${data.run?.html_url ? `<a class="open-link" href="${escapeHtml(safeGithubUrl(data.run.html_url))}" target="_blank" rel="noreferrer">Ver ejecución ↗</a>` : ''}</div></div>
    <div class="divider"></div><p class="section-label">RELEASE PÚBLICA MÁS RECIENTE</p>
    ${release ? `<div class="release-row"><div><div class="release-version">${escapeHtml(release.tag_name || release.name || 'Release')}</div><div class="release-date">${date(release.published_at)}</div></div><a class="open-link" href="${escapeHtml(safeGithubUrl(release.html_url))}" target="_blank" rel="noreferrer">Ver release ↗</a></div>` : '<div class="empty">No hay una release pública disponible.</div>'}
  </article>`;
}
async function loadRepository(repo) {
  const root = `${api}/repos/${repo.owner}/${repo.repo}`;
  const [runs, release] = await Promise.all([
    getJson(`${root}/actions/runs?per_page=1`),
    getJson(`${root}/releases/latest`)
  ]);
  return { run: runs?.workflow_runs?.[0] || null, release };
}
async function refresh() {
  const button = $('refreshButton');
  button.disabled = true;
  button.innerHTML = '<span aria-hidden="true">↻</span> Consultando';
  $('connectionText').textContent = 'Consultando GitHub';
  $('connection').className = 'connection';
  $('errorBanner').classList.add('hidden');
  const results = await Promise.all(repositories.map(async repo => {
    try { return { repo, data: await loadRepository(repo) }; }
    catch (error) { return { repo, error }; }
  }));
  const failed = results.filter(x => x.error);
  $('projectGrid').innerHTML = results.map(({ repo, data, error }) => error
    ? renderCard(repo, { run: null, release: null })
    : renderCard(repo, data)).join('');
  if (failed.length) {
    $('connectionText').textContent = 'Consulta parcial';
    $('connection').className = 'connection bad';
    $('errorBanner').textContent = failed.map(x => `${x.repo.name}: ${x.error.message}`).join(' ');
    $('errorBanner').classList.remove('hidden');
  } else {
    $('connectionText').textContent = 'Conectado a GitHub';
    $('connection').className = 'connection ok';
  }
  $('lastUpdated').textContent = `Actualizado ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
  button.disabled = false;
  button.innerHTML = '<span aria-hidden="true">↻</span> Actualizar';
}
$('refreshButton').addEventListener('click', refresh);
$('appVersion').textContent = `v${window.NACAR_LIVE_VERSION || '2.0.0'}`;
refresh();
