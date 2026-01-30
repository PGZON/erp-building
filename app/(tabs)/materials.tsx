import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MaterialsScreen() {
    const materials = useQuery(api.materials.getMaterials);
    const router = useRouter();
    const { user } = useAuth();

    // Permission Check
    const canAdd = user?.role === 'owner' || user?.role === 'editor';

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.name}>{item.name}</Text>
                    {item.category && <Text style={styles.category}>{item.category}</Text>}
                </View>
                <View style={styles.quantityBadge}>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <Text style={styles.unit}>{item.unit}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.row}>
                    <Ionicons name="pricetag-outline" size={14} color={Colors.palette.textSecondary} />
                    <Text style={styles.cost}>₹{item.cost.toLocaleString()}</Text>
                </View>
                {item.vendorName && (
                    <View style={styles.row}>
                        <Ionicons name="business-outline" size={14} color={Colors.palette.textSecondary} />
                        <Text style={styles.vendor}>{item.vendorName}</Text>
                    </View>
                )}
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                <Text style={styles.audit}>Added by {item.creatorName}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Materials</Text>
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/vendors')}>
                        <Ionicons name="people" size={20} color={Colors.palette.primary} />
                    </TouchableOpacity>
                    {canAdd && (
                        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/materials/add')}>
                            <Ionicons name="add" size={28} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {!materials ? (
                <ActivityIndicator size="large" color={Colors.palette.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={materials}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="cube-outline" size={48} color={Colors.palette.textTertiary} />
                            <Text style={styles.empty}>No inventory recorded.</Text>
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
    actions: {
        flexDirection: 'row',
        gap: Spacing.m,
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
    secondaryButton: {
        backgroundColor: Colors.palette.surfaceHighlight,
        width: 44,
        height: 44,
        borderRadius: BorderRadius.pill,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.palette.border,
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
        borderColor: Colors.palette.surfaceHighlight,
        ...Shadows.soft,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.m,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.palette.textPrimary,
    },
    category: {
        fontSize: 12,
        color: Colors.palette.textSecondary,
        marginTop: 2,
    },
    quantityBadge: {
        backgroundColor: Colors.palette.surfaceHighlight,
        paddingHorizontal: Spacing.s,
        paddingVertical: 4,
        borderRadius: BorderRadius.m,
        alignItems: 'flex-end',
    },
    quantity: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.palette.primary,
    },
    unit: {
        fontSize: 10,
        color: Colors.palette.textSecondary,
        textTransform: 'uppercase',
    },
    cardBody: {
        marginBottom: Spacing.m,
        gap: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cost: {
        fontSize: 14,
        color: Colors.palette.textPrimary,
        fontWeight: '500',
    },
    vendor: {
        fontSize: 14,
        color: Colors.palette.textSecondary,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: Colors.palette.surfaceHighlight,
        paddingTop: Spacing.s,
    },
    date: {
        fontSize: 12,
        color: Colors.palette.textTertiary,
    },
    audit: {
        fontSize: 12,
        color: Colors.palette.textTertiary,
        fontStyle: 'italic',
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
