import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

import Base from './Base'
import TopBar from '../components/topbar/TopBar'
import BottomUpTrail from '../components/animatein/BottomUpTrail'
import WrapperBox from '../components/wrapper/WrapperBox'
import backend from '../constant/backend'

function splitLines(rawValue) {
    return `${rawValue || ''}`
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
}

function recipeToFormState(recipe) {
    if (!recipe) {
        return {
            title: '',
            description: '',
            ingredientsText: '',
            stepsText: '',
        }
    }

    return {
        title: recipe.title || '',
        description: recipe.description || '',
        ingredientsText: Array.isArray(recipe.ingredients) ? recipe.ingredients.map((item) => item.name || '').join('\n') : '',
        stepsText: Array.isArray(recipe.steps) ? recipe.steps.map((item) => item.instruction || '').join('\n') : '',
    }
}

function RecipesPage({ jwt }) {
    const history = useHistory()

    const [ recipes, setRecipes ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [ errorMessage, setErrorMessage ] = useState('')

    const [ detailOpen, setDetailOpen ] = useState(false)
    const [ detailLoading, setDetailLoading ] = useState(false)
    const [ detailError, setDetailError ] = useState('')
    const [ selectedRecipe, setSelectedRecipe ] = useState(null)

    const [ formOpen, setFormOpen ] = useState(false)
    const [ saving, setSaving ] = useState(false)
    const [ deleting, setDeleting ] = useState(false)
    const [ formError, setFormError ] = useState('')
    const [ formState, setFormState ] = useState(recipeToFormState(null))

    const loadRecipes = useCallback(async () => {
        if (!jwt) {
            setRecipes([])
            return
        }

        setLoading(true)
        setErrorMessage('')
        try {
            const response = await fetch(backend.withBasePath('recipes'), {
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

    const openRecipeDetail = useCallback(async (recipeId) => {
        if (!jwt) return

        setDetailOpen(true)
        setDetailLoading(true)
        setDetailError('')
        try {
            const response = await fetch(backend.withBasePath(`recipes/${recipeId}`), {
                method: 'GET',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || `Failed to load recipe ${recipeId}`)
            }
            const payload = await response.json()
            setSelectedRecipe(payload)
        } catch (error) {
            setDetailError(error.message || 'Failed to load recipe')
            setSelectedRecipe(null)
        } finally {
            setDetailLoading(false)
        }
    }, [jwt])

    useEffect(() => {
        loadRecipes()
    }, [loadRecipes])

    const closeDetailDialog = () => {
        setDetailOpen(false)
        setSelectedRecipe(null)
        setDetailLoading(false)
        setDetailError('')
    }

    const openCreateDialog = () => {
        setSelectedRecipe(null)
        setFormState(recipeToFormState(null))
        setFormError('')
        setFormOpen(true)
    }

    const openEditDialog = () => {
        setFormState(recipeToFormState(selectedRecipe))
        setFormError('')
        setFormOpen(true)
    }

    const closeFormDialog = () => {
        if (saving) return
        setFormOpen(false)
        setFormError('')
    }

    const onFormChange = (field) => (event) => {
        setFormState((prev) => ({
            ...prev,
            [field]: event.target.value,
        }))
    }

    const submitRecipeForm = async () => {
        const ingredients = splitLines(formState.ingredientsText)
        const steps = splitLines(formState.stepsText)
        if (!formState.title.trim()) {
            setFormError('Title is required')
            return
        }
        if (ingredients.length === 0) {
            setFormError('At least one ingredient is required')
            return
        }
        if (steps.length === 0) {
            setFormError('At least one step is required')
            return
        }

        const payload = {
            title: formState.title.trim(),
            description: formState.description.trim(),
            ingredients: ingredients.map((name) => ({ name })),
            steps: steps.map((instruction) => ({ instruction })),
        }

        const isEditing = !!selectedRecipe?.id
        const targetPath = isEditing ? `recipes/${selectedRecipe.id}` : 'recipes'

        setSaving(true)
        setFormError('')
        try {
            const response = await fetch(backend.withBasePath(targetPath), {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    Authorization: jwt,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || `Failed to ${isEditing ? 'update' : 'create'} recipe`)
            }
            const created = await response.json()
            setFormOpen(false)
            setSelectedRecipe(created)
            setDetailOpen(true)
            await loadRecipes()
        } catch (error) {
            setFormError(error.message || 'Failed to save recipe')
        } finally {
            setSaving(false)
        }
    }

    const deleteRecipe = async () => {
        if (!selectedRecipe?.id) return
        if (!window.confirm(`Delete recipe "${selectedRecipe.title || `#${selectedRecipe.id}`}"?`)) return

        setDeleting(true)
        setDetailError('')
        try {
            const response = await fetch(backend.withBasePath(`recipes/${selectedRecipe.id}`), {
                method: 'DELETE',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || `Failed to delete recipe (${response.status})`)
            }
            closeDetailDialog()
            await loadRecipes()
        } catch (error) {
            setDetailError(error.message || 'Failed to delete recipe')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/setting')}
                label='Recipes'
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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 2, pb: 2 }}>
                    <Button variant='contained' startIcon={<AddIcon />} onClick={openCreateDialog}>
                        New Recipe
                    </Button>
                </Box>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '32px' }}>
                        <CircularProgress size={24} />
                    </div>
                ) : errorMessage ? (
                    <Typography color='error'>{errorMessage}</Typography>
                ) : recipes.length === 0 ? (
                    <Typography variant='body2' color='text.secondary'>
                        No recipes yet.
                    </Typography>
                ) : (
                    <BottomUpTrail>
                        {recipes.map((recipe) => (
                            <WrapperBox key={recipe.id} minHeight={'96px'} height={'auto'} marginBottom='12px'>
                                <Button
                                    variant='contained'
                                    size='large'
                                    style={{
                                        backgroundColor: '#48acdb',
                                        borderRadius: '5px',
                                        width: '100%',
                                        boxShadow: '2px 2px 6px',
                                        textTransform: 'none',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px',
                                        gap: '10px',
                                    }}
                                    onClick={() => openRecipeDetail(recipe.id)}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                                        <div
                                            style={{
                                                color: '#1f2f6f',
                                                fontSize: '18px',
                                                fontWeight: 700,
                                                maxWidth: '100%',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {recipe.title || `Recipe #${recipe.id}`}
                                        </div>
                                        <Stack direction='row' spacing={1} alignItems='center' sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                                            <Chip label={`${recipe.ingredient_count || 0} ingredients`} size='small' />
                                            <Chip label={`${recipe.step_count || 0} steps`} size='small' />
                                        </Stack>
                                        {recipe.description ? (
                                            <Typography variant='body2' sx={{ color: '#1f2f6f', mt: 0.5, textAlign: 'left' }}>
                                                {recipe.description}
                                            </Typography>
                                        ) : null}
                                    </div>
                                </Button>
                            </WrapperBox>
                        ))}
                    </BottomUpTrail>
                )}
            </div>

            <Dialog fullWidth maxWidth='sm' open={detailOpen} onClose={closeDetailDialog}>
                <DialogTitle>{selectedRecipe?.title || 'Recipe'}</DialogTitle>
                <DialogContent dividers>
                    {detailLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : detailError ? (
                        <Typography color='error'>{detailError}</Typography>
                    ) : selectedRecipe ? (
                        <Box sx={{ display: 'grid', gap: 2 }}>
                            {selectedRecipe.description ? (
                                <Typography variant='body2' color='text.secondary'>
                                    {selectedRecipe.description}
                                </Typography>
                            ) : null}
                            <Stack direction='row' spacing={1} alignItems='center' sx={{ flexWrap: 'wrap' }}>
                                <Chip label={`${selectedRecipe.ingredient_count || 0} ingredients`} size='small' />
                                <Chip label={`${selectedRecipe.step_count || 0} steps`} size='small' />
                            </Stack>
                            <Box>
                                <Typography variant='subtitle2' sx={{ mb: 1 }}>Ingredients</Typography>
                                {selectedRecipe.ingredients?.map((item) => (
                                    <Typography key={item.id || `${item.sort_order}-${item.name}`} variant='body2' sx={{ mb: 0.5 }}>
                                        {item.quantity ? `${item.quantity} ` : ''}{item.name}
                                    </Typography>
                                ))}
                            </Box>
                            <Box>
                                <Typography variant='subtitle2' sx={{ mb: 1 }}>Steps</Typography>
                                {selectedRecipe.steps?.map((item) => (
                                    <Typography key={item.id || `${item.sort_order}-${item.instruction}`} variant='body2' sx={{ mb: 1 }}>
                                        {item.sort_order}. {item.instruction}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    {selectedRecipe ? (
                        <Button onClick={openEditDialog}>Edit</Button>
                    ) : null}
                    <Button color='error' disabled={deleting || !selectedRecipe} onClick={deleteRecipe}>
                        Delete
                    </Button>
                    <Button onClick={closeDetailDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog fullWidth maxWidth='sm' open={formOpen} onClose={closeFormDialog}>
                <DialogTitle>{selectedRecipe?.id ? 'Edit Recipe' : 'New Recipe'}</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
                        {formError ? (
                            <Typography color='error'>{formError}</Typography>
                        ) : null}
                        <TextField
                            label='Title'
                            value={formState.title}
                            onChange={onFormChange('title')}
                            fullWidth
                        />
                        <TextField
                            label='Description'
                            value={formState.description}
                            onChange={onFormChange('description')}
                            multiline
                            minRows={3}
                            fullWidth
                        />
                        <TextField
                            label='Ingredients'
                            helperText='One ingredient per line'
                            value={formState.ingredientsText}
                            onChange={onFormChange('ingredientsText')}
                            multiline
                            minRows={5}
                            fullWidth
                        />
                        <TextField
                            label='Steps'
                            helperText='One step per line'
                            value={formState.stepsText}
                            onChange={onFormChange('stepsText')}
                            multiline
                            minRows={5}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeFormDialog} disabled={saving}>Cancel</Button>
                    <Button onClick={submitRecipeForm} disabled={saving} variant='contained'>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Base>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
}))(RecipesPage)
