import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExpensesScreen() {
    const expenses = useQuery(api.expenses.getExpenses);
    const router = useRouter();
    const { user } = useAuth();
    const canAdd = user?.role === 'owner' || user?.role === 'editor';

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => router.push(`/expenses/${item._id}`)}>
            <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.palette.textTertiary} />
                    <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.amount}>- ₹ {item.amount.toFixed(2)}</Text>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.badgeRow}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    {item.billStorageId && (
                        <View style={styles.attachmentBadge}>
                            <Ionicons name="attach" size={12} color={Colors.palette.accent} />
                            <Text style={styles.attachmentText}>Receipt</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.meta}>
                    <View style={styles.avatarSmall}>
                        <Text style={styles.avatarText}>{item.creatorName?.charAt(0)}</Text>
                    </View>
                    <Text style={styles.metaText}>Paid by <Text style={{ fontWeight: '600' }}>{item.paidBy}</Text></Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Expenses</Text>
                {canAdd && (
                    <TouchableOpacity style={styles.addButton} onPress={() => router.push('/expenses/add')}>
                        <Ionicons name="add" size={28} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            {!expenses ? (
                <ActivityIndicator size="large" color={Colors.palette.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={expenses}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="wallet-outline" size={48} color={Colors.palette.textTertiary} />
                            <Text style={styles.empty}>No expenses recorded yet.</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.palette.background,
    },
    header: {
        padding: Spacing.l,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.palette.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.palette.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.palette.textPrimary,
        letterSpacing: -0.5,
    },
    addButton: {
        backgroundColor: Colors.palette.primary,
        width: 44,
        height: 44,
        borderRadius: BorderRadius.pill,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.medium,
    },
    list: {
        padding: Spacing.m,
        paddingBottom: Spacing.xxl + 20,
    },
    card: {
        backgroundColor: Colors.palette.surface,
        borderRadius: BorderRadius.l,
        padding: Spacing.m,
        marginBottom: Spacing.m,
        borderWidth: 1,
        borderColor: Colors.palette.surfaceHighlight, // Subtle border instead of distinct shadow sometimes looks cleaner
        ...Shadows.soft,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    date: {
        color: Colors.palette.textTertiary,
        fontSize: 12,
        fontWeight: '500',
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.palette.textPrimary, // Cleaner than red
    },
    cardBody: {
        marginBottom: Spacing.m,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.palette.textPrimary,
        marginBottom: Spacing.s,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: Spacing.s,
    },
    categoryBadge: {
        backgroundColor: Colors.palette.surfaceHighlight,
        paddingHorizontal: Spacing.s,
        paddingVertical: 4,
        borderRadius: BorderRadius.s,
    },
    categoryText: {
        color: Colors.palette.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    attachmentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF', // Light Blue
        paddingHorizontal: Spacing.s,
        paddingVertical: 4,
        borderRadius: BorderRadius.s,
        gap: 2,
    },
    attachmentText: {
        color: Colors.palette.accent,
        fontSize: 12,
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.palette.surfaceHighlight,
        paddingTop: Spacing.s,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
    },
    avatarSmall: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.palette.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    metaText: {
        fontSize: 12,
        color: Colors.palette.textSecondary,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
    empty: {
        fontSize: 16,
        color: Colors.palette.textSecondary,
        marginTop: Spacing.m,
    }
});
