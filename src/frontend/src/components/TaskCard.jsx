import React, { useState } from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton,
    List, ListItem, ListItemText } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import DeleteIcon from '@mui/icons-material/Delete';
import { getComments, createComment, deleteComment, getTaskTags,
    addTagToTask, removeTagFromTask } from '../services/api';

const priorityColors = { High: 'error', Medium: 'warning', Low: 'success' };
const statusColors = { Todo: 'default', InProgress: 'primary', Done: 'success' };

export default function TaskCard({ task, onEdit, onDelete, allTags }) {
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [taskTags, setTaskTags] = useState([]);
    const [tagsLoaded, setTagsLoaded] = useState(false);

    const loadComments = async () => {
        try {
            const res = await getComments(task.id);
            setComments(res.data);
        } catch (err) {
            console.error('Failed to load comments:', err);
        }
    };

    const loadTags = async () => {
        if (!tagsLoaded) {
            try {
                const res = await getTaskTags(task.id);
                setTaskTags(res.data);
                setTagsLoaded(true);
            } catch (err) {
                console.error('Failed to load tags:', err);
            }
        }
    };

    const handleOpenComments = () => {
        setCommentsOpen(true);
        loadComments();
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            await createComment(task.id, newComment);
            setNewComment('');
            loadComments();
        } catch (err) {
            console.error('Failed to add comment:', err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(commentId);
            loadComments();
        } catch (err) {
            console.error('Failed to delete comment:', err);
        }
    };

    const handleAddTag = async (tagId) => {
        try {
            await addTagToTask(task.id, tagId);
            loadTags();
        } catch (err) {
            if (err.response?.status !== 400) {
                console.error('Failed to add tag:', err);
            }
        }
    };

    const handleRemoveTag = async (tagId) => {
        try {
            await removeTagFromTask(task.id, tagId);
            loadTags();
        } catch (err) {
            console.error('Failed to remove tag:', err);
        }
    };

    // Load tags on mount
    React.useEffect(() => {
        loadTags();
    }, []);

    return (
        <>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6">{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        {task.description}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                        <Chip size="small" label={task.priority}
                            color={priorityColors[task.priority]}
                            data-testid={`priority-badge-${task.priority?.toLowerCase()}`} />
                        <Chip size="small" label={task.status}
                            color={statusColors[task.status]} />
                        {task.category && <Chip size="small" label={task.category} />}
                    </Box>

                    {/* Tags */}
                    <Box display="flex" gap={0.5} flexWrap="wrap" mt={1}>
                        {taskTags.map(tag => (
                            <Chip
                                key={tag.id}
                                label={tag.name}
                                size="small"
                                onDelete={() => handleRemoveTag(tag.id)}
                                sx={{
                                    backgroundColor: tag.color,
                                    color: '#fff',
                                    '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' }
                                }}
                            />
                        ))}
                    </Box>

                    {/* Add Tag Dropdown */}
                    {allTags && allTags.length > 0 && (
                        <Box mt={1}>
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleAddTag(parseInt(e.target.value));
                                        e.target.value = '';
                                    }
                                }}
                                style={{
                                    fontSize: '12px',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc'
                                }}
                            >
                                <option value="">+ Add Tag</option>
                                {allTags
                                    .filter(tag => !taskTags.some(tt => tt.id === tag.id))
                                    .map(tag => (
                                        <option key={tag.id} value={tag.id}>{tag.name}</option>
                                    ))
                                }
                            </select>
                        </Box>
                    )}

                    {task.due_date && (
                        <Typography variant="caption" display="block" mt={1}>
                            📅 Due: {task.due_date}
                        </Typography>
                    )}
                </CardContent>
                <CardActions>
                    <Button size="small" onClick={() => onEdit(task)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => onDelete(task.id)}>Delete</Button>
                    <IconButton size="small" onClick={handleOpenComments}>
                        <CommentIcon fontSize="small" />
                    </IconButton>
                </CardActions>
            </Card>

            {/* Comments Dialog */}
            <Dialog open={commentsOpen} onClose={() => setCommentsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Comments for "{task.title}"</DialogTitle>
                <DialogContent>
                    <List>
                        {comments.map(comment => (
                            <ListItem
                                key={comment.id}
                                secondaryAction={
                                    <IconButton edge="end" onClick={() => handleDeleteComment(comment.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                }
                            >
                                <ListItemText
                                    primary={comment.content}
                                    secondary={new Date(comment.created_at).toLocaleString()}
                                />
                            </ListItem>
                        ))}
                        {comments.length === 0 && (
                            <Typography color="text.secondary" textAlign="center" py={2}>
                                No comments yet
                            </Typography>
                        )}
                    </List>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCommentsOpen(false)}>Close</Button>
                    <Button variant="contained" onClick={handleAddComment}>Add Comment</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
