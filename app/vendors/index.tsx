import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VendorsScreen() {
    const vendors = useQuery(api.vendors.getVendors);
    const router = useRouter();
    const { user } = useAuth();

    const canAdd = user?.role === 'owner' || user?.role === 'editor';

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => {
                // Future: Go to detail
            }}
        >
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{item.type}</Text>
                    </View>
                </View>
            </View>

            {item.contact && (
                <View style={styles.contactRow}>
                    <View style={styles.iconBox}>
                        <Ionicons name="call-outline" size={14} color={Colors.palette.textSecondary} />
                    </View>
                    <Text style={styles.contact}>{item.contact}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.palette.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vendors</Text>
                {canAdd && (
                    <TouchableOpacity style={styles.addButton} onPress={() => router.push('/vendors/add')}>
                        <Ionicons name="add" size={28} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            {!vendors ? (
                <ActivityIndicator size="large" color={Colors.palette.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={vendors}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={48} color={Colors.palette.textTertiary} />
                            <Text style={styles.empty}>No vendors found.</Text>
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
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.palette.textPrimary,
    },
    addButton: {
        backgroundColor: Colors.palette.primary,
        width: 40,
        height: 40,
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
        borderColor: Colors.palette.surfaceHighlight,
        ...Shadows.soft,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.m,
        gap: Spacing.m,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.palette.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.palette.border,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.palette.primary,
    },
    headerInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.palette.textPrimary,
        marginBottom: 4,
    },
    typeBadge: {
        backgroundColor: '#F0F9FF', // Light Sky Blue
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BorderRadius.s,
        alignSelf: 'flex-start',
    },
    typeText: {
        color: '#0284C7', // Sky 600
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
        backgroundColor: Colors.palette.surfaceHighlight,
        padding: Spacing.s,
        borderRadius: BorderRadius.m,
    },
    iconBox: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contact: {
        color: Colors.palette.textSecondary,
        fontSize: 14,
        fontWeight: '500',
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
