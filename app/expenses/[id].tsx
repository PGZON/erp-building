import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExpenseDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    // We fetch the expense using the new getExpense query
    // The query returns null if deleted or not found
    const expense = useQuery(api.expenses.getExpense, { id: id as Id<"expenses"> });
    const deleteExpense = useMutation(api.expenses.deleteExpense);

    const isOwner = user?.role === 'owner';

    const handleDelete = () => {
        Alert.alert(
            "Delete Expense",
            "Are you sure you want to delete this expense? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteExpense({ id: id as Id<"expenses">, userId: user!._id });
                            router.back();
                        } catch (e: any) {
                            Alert.alert("Error", e.message || "Failed to delete");
                        }
                    }
                }
            ]
        );
    };

    if (expense === undefined) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.palette.primary} />
            </SafeAreaView>
        );
    }

    if (expense === null) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.palette.textPrimary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={Colors.palette.textTertiary} />
                    <Text style={styles.errorText}>Expense not found or deleted</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.palette.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Expense Details</Text>
                {isOwner ? (
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                        <Ionicons name="trash-outline" size={20} color={Colors.palette.danger} />
                    </TouchableOpacity>
                ) : <View style={{ width: 24 }} />}
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Main Card */}
                <View style={styles.mainCard}>
                    <View style={styles.amountRow}>
                        <Text style={styles.label}>Amount</Text>
                        <Text style={styles.amount}>₹ {expense.amount.toFixed(2)}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Ionicons name="pricetag-outline" size={18} color={Colors.palette.textSecondary} />
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Title</Text>
                            <Text style={styles.detailValue}>{expense.title}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="folder-open-outline" size={18} color={Colors.palette.textSecondary} />
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Category</Text>
                            <View style={styles.chip}>
                                <Text style={styles.chipText}>{expense.category}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={18} color={Colors.palette.textSecondary} />
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Date</Text>
                            <Text style={styles.detailValue}>{new Date(expense.date).toLocaleDateString()} {new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={18} color={Colors.palette.textSecondary} />
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Paid By</Text>
                            <Text style={styles.detailValue}>{expense.paidBy}</Text>
                        </View>
                    </View>
                </View>

                {/* Notes Section */}
                {expense.notes ? (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Notes</Text>
                        <Text style={styles.notesText}>{expense.notes}</Text>
                    </View>
                ) : null}

                {/* Receipt Image */}
                {expense.billUrls && expense.billUrls.length > 0 ? (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Receipts / Bills ({expense.billUrls.length})</Text>
                        {expense.billUrls.map((url, index) => (
                            <View key={index} style={styles.imageContainer}>
                                <Image
                                    source={{ uri: url }}
                                    style={styles.billImage}
                                    resizeMode="contain"
                                />
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={[styles.sectionCard, styles.noReceipt]}>
                        <Ionicons name="document-text-outline" size={24} color={Colors.palette.textTertiary} />
                        <Text style={styles.noReceiptText}>No receipt attached</Text>
                    </View>
                )}

                {/* Audit Info */}
                <View style={styles.auditContainer}>
                    <Text style={styles.auditText}>Created by: {expense.creatorName}</Text>
                    <Text style={styles.auditText}>Last Modified by: {expense.editorName}</Text>
                    <Text style={styles.auditText}>ID: {expense._id}</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.palette.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.palette.background,
    },
    header: {
        padding: Spacing.l,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.palette.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.palette.border,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.palette.textPrimary,
    },
    deleteButton: {
        padding: 4,
    },
    content: {
        padding: Spacing.l,
        gap: Spacing.l,
        paddingBottom: Spacing.xxl
    },
    mainCard: {
        backgroundColor: Colors.palette.surface,
        borderRadius: BorderRadius.l,
        padding: Spacing.l,
        ...Shadows.soft,
    },
    amountRow: {
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    label: {
        fontSize: 12,
        color: Colors.palette.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    amount: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.palette.primary, // Prof. Navy
    },
    divider: {
        height: 1,
        backgroundColor: Colors.palette.surfaceHighlight,
        marginVertical: Spacing.m,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: Spacing.l,
        alignItems: 'flex-start',
    },
    detailTextContainer: {
        marginLeft: Spacing.m,
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: Colors.palette.textTertiary,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 16,
        color: Colors.palette.textPrimary,
        fontWeight: '500',
    },
    chip: {
        backgroundColor: Colors.palette.surfaceHighlight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BorderRadius.s,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    chipText: {
        fontSize: 12,
        color: Colors.palette.textSecondary,
        fontWeight: '600',
    },
    sectionCard: {
        backgroundColor: Colors.palette.surface,
        borderRadius: BorderRadius.l,
        padding: Spacing.l,
        ...Shadows.soft,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.palette.textPrimary,
        marginBottom: Spacing.m,
    },
    notesText: {
        fontSize: 14,
        color: Colors.palette.textSecondary,
        lineHeight: 20,
    },
    imageContainer: {
        marginBottom: Spacing.m,
        borderRadius: BorderRadius.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.palette.border,
    },
    billImage: {
        width: '100%',
        height: 300,
        backgroundColor: '#f0f0f0',
    },
    noReceipt: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl,
    },
    noReceiptText: {
        color: Colors.palette.textTertiary,
        marginTop: Spacing.s,
    },
    auditContainer: {
        marginTop: Spacing.m,
        alignItems: 'center',
        opacity: 0.6,
    },
    auditText: {
        fontSize: 10,
        color: Colors.palette.textTertiary,
        marginBottom: 2,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        marginTop: Spacing.m,
        fontSize: 16,
        color: Colors.palette.textSecondary,
    }
});
