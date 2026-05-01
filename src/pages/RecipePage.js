import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

import Base from './Base'
import TopBar from '../components/topbar/TopBar'
import BottomUpTrail from '../components/animatein/BottomUpTrail'
import WrapperBox from '../components/wrapper/WrapperBox'
import backend from '../constant/backend'

const emptyForm = {
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    serving_size: '',
    prep_minutes: '0',
    cook_minutes: '0',
    tags: '',
}

function parseMinutes(value) {
    const parsed = Number.parseInt(`${value || '0'}`, 10)
    if (Number.isNaN(parsed) || parsed < 0) return 0
    return parsed
}

function formatTotalMinutes(recipe) {
    const total = Number(recipe?.prep_minutes || 0) + Number(recipe?.cook_minutes || 0)
    if (total <= 0) return 'No timing yet'
    return `${total} min total`
}

function RecipePage({ history, jwt }) {
    const [ recipes, setRecipes ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [ saving, setSaving ] = useState(false)
    const [ deletingId, setDeletingId ] = useState(null)
    const [ errorMessage, setErrorMessage ] = useState('')
    const [ formOpen, setFormOpen ] = useState(false)
    const [ editingRecipeId, setEditingRecipeId ] = useState(null)
    const [ formValues, setFormValues ] = useState(emptyForm)

    const dialogTitle = useMemo(() => editingRecipeId ? 'Edit Recipe' : 'Create Recipe', [editingRecipeId])

    const loadRecipes = useCallback(async () => {
        if (!jwt) {
            setRecipes([])
            return
        }

        setLoading(true)
        setErrorMessage('')
        try {
            const response = await fetch(backend.withBasePath('recipes?limit=100'), {
                method: 'GET',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || `Failed to load recipes (${response.status})`)
            }
            const payload = await response.json()
            setRecipes(Array.isArray(payload?.items) ? payload.items : [])
        } catch (error) {
            setErrorMessage(error.message || 'Failed to load recipes')
        } finally {
            setLoading(false)
        }
    }, [jwt])

    useEffect(() => {
        loadRecipes()
    }, [loadRecipes])

    const resetDialogState = () => {
        setFormOpen(false)
        setEditingRecipeId(null)
        setFormValues(emptyForm)
    }

    const closeDialog = () => {
        if (saving) return
        resetDialogState()
    }

    const openCreateDialog = () => {
        setEditingRecipeId(null)
        setFormValues(emptyForm)
        setFormOpen(true)
        setErrorMessage('')
    }

    const openEditDialog = (recipe) => {
        setEditingRecipeId(recipe.id)
        setFormValues({
            title: recipe.title || '',
            description: recipe.description || '',
            ingredients: recipe.ingredients || '',
            instructions: recipe.instructions || '',
            serving_size: recipe.serving_size || '',
            prep_minutes: `${recipe.prep_minutes || 0}`,
            cook_minutes: `${recipe.cook_minutes || 0}`,
            tags: recipe.tags || '',
        })
        setFormOpen(true)
        setErrorMessage('')
    }

    const onChangeField = (field) => (event) => {
        setFormValues((current) => ({
            ...current,
            [field]: event.target.value,
        }))
    }

    const onSubmit = async () => {
        const payload = {
            ...formValues,
            prep_minutes: parseMinutes(formValues.prep_minutes),
            cook_minutes: parseMinutes(formValues.cook_minutes),
        }

        setSaving(true)
        setErrorMessage('')
        try {
            const response = await fetch(
                editingRecipeId ? backend.withBasePath(`recipes/${editingRecipeId}`) : backend.withBasePath('recipes'),
                {
                    method: editingRecipeId ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: jwt,
                    },
                    body: JSON.stringify(payload),
                }
            )
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || `Failed to save recipe (${response.status})`)
            }
            resetDialogState()
            await loadRecipes()
        } catch (error) {
            setErrorMessage(error.message || 'Failed to save recipe')
        } finally {
            setSaving(false)
        }
    }

    const onDelete = async (recipe) => {
        if (!window.confirm(`Delete recipe "${recipe.title}"?`)) return

        setDeletingId(recipe.id)
        setErrorMessage('')
        try {
            const response = await fetch(backend.withBasePath(`recipes/${recipe.id}`), {
                method: 'DELETE',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || `Failed to delete recipe (${response.status})`)
            }
            await loadRecipes()
        } catch (error) {
            setErrorMessage(error.message || 'Failed to delete recipe')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <Base>
            <TopBar
                label='Recipes'
                onBackHandler={() => history.replace('/setting')}
            />
            <div
                style={{
                    position: 'absolute',
                    height: '80%',
                    width: '95%',
                    paddingLeft: '5%',
                    paddingTop: '20px',
                    overflow: 'auto',
                }}
            >
                <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ pr: 2, pb: 2 }}>
                    <Typography variant='h6' sx={{ color: '#18445f', fontWeight: 700 }}>
                        Shared recipe book
                    </Typography>
                    <Button
                        variant='contained'
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={openCreateDialog}
                        sx={{ textTransform: 'none', backgroundColor: '#2a8f6a' }}
                    >
                        New Recipe
                    </Button>
                </Stack>

                {errorMessage ? <Alert severity='error' sx={{ mb: 2, mr: 2 }}>{errorMessage}</Alert> : null}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : recipes.length === 0 ? (
                    <Typography variant='body2' color='text.secondary'>
                        No recipes yet. Create the first one from this page.
                    </Typography>
                ) : (
                    <BottomUpTrail>
                        {recipes.map((recipe) => (
                            <WrapperBox key={recipe.id} minHeight={180} height='auto' marginBottom='14px'>
                                <Card elevation={0} sx={{ height: '100%', borderRadius: '8px', backgroundColor: '#f7fbff' }}>
                                    <CardContent>
                                        <Stack direction='row' justifyContent='space-between' spacing={2} alignItems='flex-start'>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                                                    <RestaurantMenuIcon sx={{ color: '#2a8f6a' }} />
                                                    <Typography variant='h6' sx={{ color: '#18445f', fontWeight: 700 }}>
                                                        {recipe.title}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                                                    {recipe.description || 'No description yet.'}
                                                </Typography>
                                                <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                                                    <AccessTimeIcon sx={{ fontSize: 18, color: '#5b7b8c' }} />
                                                    <Typography variant='body2' color='text.secondary'>
                                                        {formatTotalMinutes(recipe)}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', color: '#355063', mb: 1 }}>
                                                    <strong>Ingredients:</strong> {recipe.ingredients || 'Not added yet'}
                                                </Typography>
                                                <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', color: '#355063', mb: 1 }}>
                                                    <strong>Instructions:</strong> {recipe.instructions || 'Not added yet'}
                                                </Typography>
                                                <Typography variant='caption' color='text.secondary'>
                                                    Serves: {recipe.serving_size || 'N/A'} | Tags: {recipe.tags || 'None'}
                                                </Typography>
                                            </Box>
                                            <Stack spacing={1}>
                                                <Button
                                                    variant='outlined'
                                                    startIcon={<EditIcon />}
                                                    onClick={() => openEditDialog(recipe)}
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant='outlined'
                                                    color='error'
                                                    startIcon={<DeleteOutlineIcon />}
                                                    onClick={() => onDelete(recipe)}
                                                    disabled={deletingId === recipe.id}
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    {deletingId === recipe.id ? 'Deleting...' : 'Delete'}
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </WrapperBox>
                        ))}
                    </BottomUpTrail>
                )}
            </div>

            <Dialog open={formOpen} onClose={closeDialog} fullWidth maxWidth='md'>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label='Title' value={formValues.title} onChange={onChangeField('title')} fullWidth required />
                        <TextField label='Description' value={formValues.description} onChange={onChangeField('description')} fullWidth multiline minRows={2} />
                        <TextField label='Ingredients' value={formValues.ingredients} onChange={onChangeField('ingredients')} fullWidth multiline minRows={4} />
                        <TextField label='Instructions' value={formValues.instructions} onChange={onChangeField('instructions')} fullWidth multiline minRows={5} />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField label='Serving Size' value={formValues.serving_size} onChange={onChangeField('serving_size')} fullWidth />
                            <TextField label='Prep Minutes' type='number' value={formValues.prep_minutes} onChange={onChangeField('prep_minutes')} fullWidth />
                            <TextField label='Cook Minutes' type='number' value={formValues.cook_minutes} onChange={onChangeField('cook_minutes')} fullWidth />
                        </Stack>
                        <TextField label='Tags' value={formValues.tags} onChange={onChangeField('tags')} fullWidth helperText='Comma-separated tags are fine.' />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
                    <Button onClick={onSubmit} variant='contained' disabled={saving} sx={{ textTransform: 'none' }}>
                        {saving ? 'Saving...' : 'Save Recipe'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Base>
    )
}

export default connect((state) => ({
    jwt: state.auth.jwt,
}))(RecipePage)
