import { useEffect, useMemo, useState } from 'react'
import { Add, DeleteOutlined, EditOutlined, Inventory2Outlined, Search } from '@mui/icons-material'
import { Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, IconButton, InputAdornment, InputLabel, Menu, MenuItem, Paper, Select, Snackbar, Stack, TextField, Tooltip, Typography } from '@mui/material'
import type { Asset, AssetStatus } from './api'
import { createAsset, deleteAsset, getAssets, updateAsset } from './api'
import { assetFormSchema, getAssetFormErrors, type AssetForm } from './assets/asset.schema'
import { useAuth } from './auth'
import './App.css'

const emptyForm: AssetForm = { name: '', description: '', assetTag: '', status: 'AVAILABLE' }
const statusColor: Record<AssetStatus, 'success' | 'warning' | 'info'> = { AVAILABLE: 'info', ASSIGNED: 'success', MAINTENANCE: 'warning' }

function App() {
  const { logout, username } = useAuth()
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null)
  const [notice, setNotice] = useState('')
  const [noticeError, setNoticeError] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const visibleFormErrors = formErrors

  useEffect(() => { getAssets().then(setAssets).catch((error: unknown) => showNotice(error instanceof Error ? error.message : 'Could not load assets.', true)) }, [])
  const filteredAssets = useMemo(() => assets.filter((asset) => {
    const searchable = `${asset.name} ${asset.description} ${asset.assetTag} ${asset.status}`.toLowerCase()
    return searchable.includes(search.toLowerCase()) && (statusFilter === 'ALL' || asset.status === statusFilter)
  }), [assets, search, statusFilter])
  const showNotice = (message: string, error = false) => { setNotice(message); setNoticeError(error) }
  const closeProfile = () => setProfileAnchor(null)
  const usernameInitial = username?.trim().charAt(0).toUpperCase() || '?'
  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormErrors({}); setDialogOpen(true) }
  const openEdit = (asset: Asset) => { setEditing(asset); setForm({ name: asset.name, description: asset.description ?? '', assetTag: asset.assetTag, status: asset.status }); setFormErrors({}); setDialogOpen(true) }
  const setField = (field: keyof AssetForm, value: string) => {
    const nextForm = { ...form, [field]: value }
    setForm(nextForm)
    const fieldError = getAssetFormErrors(nextForm)[field]
    setFormErrors((current) => {
      const nextErrors = { ...current }
      if (fieldError) {
        nextErrors[field] = fieldError
      } else {
        delete nextErrors[field]
      }
      return nextErrors
    })
  }

  const saveAsset = async () => {
    const clientErrors = getAssetFormErrors(form)
    if (Object.keys(clientErrors).length > 0) { setFormErrors(clientErrors); return }
    try {
      const payload = { name: form.name.trim(), assetTag: form.assetTag.trim(), status: form.status, ...(form.description.trim() ? { description: form.description.trim() } : {}) }
      const saved = editing
        ? await updateAsset(editing.id, payload)
        : await createAsset(payload as Parameters<typeof createAsset>[0])
      setAssets((current) => editing ? current.map((asset) => asset.id === editing.id ? saved : asset) : [...current, saved])
      setDialogOpen(false)
      showNotice(editing ? 'Asset updated.' : 'Asset added.')
    } catch (error: unknown) {
      if (hasFieldErrors(error)) setFormErrors(error.fieldErrors)
      showNotice(error instanceof Error ? error.message : 'The asset could not be saved.', true)
    }
  }

  const removeAsset = async () => {
    if (!deleteTarget) return
    try {
      await deleteAsset(deleteTarget.id)
      setAssets((current) => current.filter((asset) => asset.id !== deleteTarget.id))
      showNotice('Asset deleted.')
    } catch (error: unknown) { showNotice(error instanceof Error ? error.message : 'The asset could not be deleted.', true) }
    setDeleteTarget(null)
  }

  return <Box className="inventory-page">
    <Box className="page-heading"><Box><Typography className="eyebrow">ASSET INVENTORY</Typography><Typography variant="h1">Everything in its place.</Typography><Typography className="subtitle">Track, manage, and make the most of every asset your team owns.</Typography></Box><Stack alignItems="center" spacing={2}><IconButton aria-label="Open account menu" disableRipple sx={{ '&:hover': { backgroundColor: 'transparent' } }} onClick={(event) => setProfileAnchor(event.currentTarget)}><Avatar sx={{ width: 40, height: 40 }}>{usernameInitial}</Avatar></IconButton><Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add asset</Button><Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={closeProfile} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}><MenuItem disabled>{username}</MenuItem><MenuItem onClick={() => { closeProfile(); void logout() }}>Sign out</MenuItem></Menu></Stack></Box>
    <Box className="stats-grid"><StatCard label="Total assets" value={assets.length.toString()} detail="From the backend" accent="blue" icon={<Inventory2Outlined />} /><StatCard label="In use" value={assets.filter((asset) => asset.status === 'ASSIGNED').length.toString()} detail="Currently assigned" accent="green" icon={<Inventory2Outlined />} /></Box>
    <Paper className="asset-panel" elevation={0}>
      <Box className="panel-header"><Box><Typography className="panel-title">All assets</Typography><Typography className="panel-subtitle">Assets loaded from the backend service</Typography></Box><Typography className="asset-count">{filteredAssets.length} of {assets.length}</Typography></Box><Divider />
      <Box className="filter-bar"><TextField className="search-field" placeholder="Search by name, tag, description..." value={search} onChange={(event) => setSearch(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} /><FormControl className="status-select" size="small"><InputLabel>Status</InputLabel><Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><MenuItem value="ALL">All statuses</MenuItem><MenuItem value="AVAILABLE">Available</MenuItem><MenuItem value="ASSIGNED">Assigned</MenuItem><MenuItem value="MAINTENANCE">Maintenance</MenuItem></Select></FormControl></Box>
      <Box className="asset-table"><Box className="table-row table-head"><Typography>Asset</Typography><Typography>Asset tag</Typography><Typography>Status</Typography><Typography>Description</Typography><Typography>Actions</Typography></Box>{filteredAssets.map((asset) => <Box className="table-row" key={asset.id}><Box className="asset-cell"><Box className="asset-icon"><Inventory2Outlined /></Box><Box><Typography className="asset-name">{asset.name}</Typography><Typography className="asset-id">ID: {asset.id}</Typography></Box></Box><Typography className="table-text">{asset.assetTag}</Typography><Chip label={asset.status} color={statusColor[asset.status]} size="small" /><Typography className="table-text description-cell">{asset.description || 'No description'}</Typography><Box className="row-actions"><Tooltip title="Edit asset"><IconButton size="small" onClick={() => openEdit(asset)}><EditOutlined fontSize="small" /></IconButton></Tooltip><Tooltip title="Delete asset"><IconButton size="small" onClick={() => setDeleteTarget(asset)}><DeleteOutlined fontSize="small" /></IconButton></Tooltip></Box></Box>)}{filteredAssets.length === 0 && <Box className="empty-state"><Search /><Typography>{assets.length === 0 ? 'No assets returned by the backend.' : 'No assets match your search.'}</Typography></Box>}</Box>
    </Paper>

    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm"><DialogTitle>{editing ? 'Edit asset' : 'Add a new asset'}</DialogTitle><DialogContent><Stack spacing={2} className="asset-form"><TextField label="Asset name" required value={form.name} error={Boolean(visibleFormErrors.name)} helperText={visibleFormErrors.name || `${form.name.length}/255`} onChange={(event) => setField('name', event.target.value)} /><TextField label="Description" multiline minRows={3} value={form.description} error={Boolean(visibleFormErrors.description)} helperText={visibleFormErrors.description || `${form.description.length}/5000`} onChange={(event) => setField('description', event.target.value)} /><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField fullWidth label="Asset tag" required value={form.assetTag} error={Boolean(visibleFormErrors.assetTag)} helperText={visibleFormErrors.assetTag || `${form.assetTag.length}/100`} onChange={(event) => setField('assetTag', event.target.value)} /><FormControl fullWidth error={Boolean(visibleFormErrors.status)}><InputLabel>Status</InputLabel><Select label="Status" value={form.status} onChange={(event) => setField('status', event.target.value)}><MenuItem value="AVAILABLE">Available</MenuItem><MenuItem value="ASSIGNED">Assigned</MenuItem><MenuItem value="MAINTENANCE">Maintenance</MenuItem></Select>{visibleFormErrors.status && <Typography color="error" variant="caption">{visibleFormErrors.status}</Typography>}</FormControl></Stack></Stack></DialogContent><DialogActions><Button onClick={() => setDialogOpen(false)}>Cancel</Button><Button variant="contained" onClick={saveAsset} disabled={!assetFormSchema.safeParse(form).success}>{editing ? 'Save changes' : 'Add asset'}</Button></DialogActions></Dialog>
    <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs"><DialogTitle>Delete this asset?</DialogTitle><DialogContent><Typography color="text.secondary">This will permanently remove {deleteTarget?.name} from the database.</Typography></DialogContent><DialogActions><Button onClick={() => setDeleteTarget(null)}>Cancel</Button><Button color="error" variant="contained" onClick={removeAsset}>Delete asset</Button></DialogActions></Dialog>
    <Snackbar open={Boolean(notice)} autoHideDuration={4000} onClose={() => setNotice('')}><Alert severity={noticeError ? 'error' : 'success'} onClose={() => setNotice('')}>{notice}</Alert></Snackbar>
  </Box>
}

function StatCard({ label, value, detail, icon, accent }: { label: string; value: string; detail: string; icon: React.ReactNode; accent: string }) { return <Paper className="stat-card" elevation={0}><Box className={`stat-icon ${accent}`}>{icon}</Box><Box><Typography className="stat-label">{label}</Typography><Typography className="stat-value">{value}</Typography><Typography className="stat-detail">{detail}</Typography></Box></Paper> }

function hasFieldErrors(error: unknown): error is { fieldErrors: Record<string, string> } {
  return typeof error === 'object' && error !== null && 'fieldErrors' in error && typeof error.fieldErrors === 'object' && error.fieldErrors !== null
}

export default App
