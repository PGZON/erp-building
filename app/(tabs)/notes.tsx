import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotesScreen() {
    const { user } = useAuth();
    const notes = useQuery(api.notes.getNotes);
    const addNote = useMutation(api.notes.addNote);
    const deleteNote = useMutation(api.notes.deleteNote);

    const [newNote, setNewNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleAddNote = async () => {
        if (!newNote.trim() || !user) return;
        setSubmitting(true);
        try {
            await addNote({ content: newNote.trim(), userId: user._id as any });
            setNewNote('');
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: any) => {
        try {
            await deleteNote({ id });
        } catch (e) {
            console.error(e);
        }
    };

    const getRandomColor = (id: string) => {
        const colors = [Colors.palette.primary, Colors.palette.accent, Colors.palette.secondary, Colors.palette.warning];
        // Use ID to consistently pick a color
        const index = id.charCodeAt(id.length - 1) % colors.length;
        return colors[index];
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Notes</Text>
                    <Text style={styles.headerSubtitle}>{notes ? `${notes.length} notes` : '...'}</Text>
                </View>
                <View style={styles.headerIcon}>
                    <Ionicons name="document-text" size={24} color={Colors.palette.primary} />
                </View>
            </View>

            <View style={styles.content}>
                {!notes ? (
                    <ActivityIndicator size="large" color={Colors.palette.primary} style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={notes}
                        keyExtractor={(item) => item._id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconBg}>
                                    <Ionicons name="create-outline" size={48} color={Colors.palette.primary} />
                                </View>
                                <Text style={styles.emptyTitle}>Start Writing</Text>
                                <Text style={styles.emptyText}>Capture your ideas, lists, and reminders here.</Text>
                            </View>
                        }
                        renderItem={({ item }) => {
                            const accentColor = getRandomColor(item._id);
                            return (
                                <View style={styles.noteCard}>
                                    <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
                                    <View style={styles.noteInner}>
                                        <Text style={styles.noteContent}>{item.content}</Text>
                                        <View style={styles.noteFooter}>
                                            <View style={styles.dateBadge}>
                                                <Ionicons name="time-outline" size={12} color={Colors.palette.textTertiary} />
                                                <Text style={styles.noteDate}>
                                                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => handleDelete(item._id)}
                                                style={styles.deleteBtn}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Ionicons name="trash-outline" size={16} color={Colors.palette.textTertiary} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            );
                        }}
                    />
                )}
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                style={styles.inputWrapper}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a new note..."
                        placeholderTextColor={Colors.palette.textTertiary}
                        value={newNote}
                        onChangeText={setNewNote}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !newNote.trim() && styles.sendBtnDisabled]}
                        onPress={handleAddNote}
                        disabled={!newNote.trim() || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="arrow-up" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.palette.background,
    },
    header: {
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.m,
        backgroundColor: Colors.palette.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.palette.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.palette.textPrimary,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.palette.textSecondary,
        fontWeight: '500',
    },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.palette.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    list: {
        padding: Spacing.m,
        paddingBottom: 100, // Space for input
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
        paddingHorizontal: Spacing.xl,
    },
    emptyIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.palette.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.palette.textPrimary,
        marginBottom: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.palette.textSecondary,
        fontSize: 16,
        lineHeight: 24,
    },
    noteCard: {
        backgroundColor: Colors.palette.surface,
        borderRadius: BorderRadius.l,
        marginBottom: Spacing.m,
        flexDirection: 'row',
        overflow: 'hidden',
        ...Shadows.medium,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    cardAccent: {
        width: 6,
        height: '100%',
    },
    noteInner: {
        flex: 1,
        padding: Spacing.m,
    },
    noteContent: {
        fontSize: 16,
        color: Colors.palette.textPrimary,
        marginBottom: Spacing.m,
        lineHeight: 24,
    },
    noteFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.palette.surfaceHighlight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BorderRadius.s,
        gap: 4,
    },
    noteDate: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.palette.textSecondary,
        textTransform: 'uppercase',
    },
    deleteBtn: {
        padding: 4,
        opacity: 0.6,
    },
    inputWrapper: {
        backgroundColor: Colors.palette.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.palette.border,
        padding: Spacing.m,
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.palette.surfaceHighlight,
        borderRadius: 24,
        padding: 4,
        alignItems: 'flex-end',
        borderWidth: 1,
        borderColor: Colors.palette.border,
    },
    input: {
        flex: 1,
        paddingHorizontal: Spacing.m,
        paddingVertical: 10,
        minHeight: 44,
        maxHeight: 120,
        fontSize: 16,
        color: Colors.palette.textPrimary,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.palette.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnDisabled: {
        backgroundColor: Colors.palette.textTertiary,
        opacity: 0.5,
    }
});
