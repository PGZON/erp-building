import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    // Fetch data for export
    const allExpenses = useQuery(api.expenses.getExpenses) || [];

    const handleExport = async () => {
        try {
            if (allExpenses.length === 0) {
                Alert.alert("No Data", "No expenses to export.");
                return;
            }

            // CSV Creation
            const header = "Date,Title,Amount,Category,PaidBy,Notes\n";
            const rows = allExpenses.map(e =>
                `"${new Date(e.date).toLocaleDateString()}","${e.title}",${e.amount},"${e.category}","${e.paidBy}","${e.notes || ''}"`
            ).join("\n");

            const csvContent = header + rows;
            // @ts-ignore
            const fileUri = ((FileSystem.documentDirectory || FileSystem.cacheDirectory) as string) + "expenses_export.csv";

            await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: 'utf8' });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert("Exported", "File saved to: " + fileUri);
            }
        } catch (e: any) {
            console.error(e);
            Alert.alert("Error", "Export failed: " + e.message);
        }
    };

    const handleLogout = async () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign Out", style: "destructive", onPress: () => {
                    signOut();
                    router.replace('/login');
                }
            }
        ])
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings & Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Profile Section */}
                <View style={styles.section}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
                        </View>
                        <View>
                            <Text style={styles.name}>{user?.name}</Text>
                            <Text style={styles.email}>{user?.email}</Text>
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Data Management */}
                <Text style={styles.sectionTitle}>Data Management</Text>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.option} onPress={handleExport}>
                        <View style={[styles.iconBox, { backgroundColor: Colors.palette.surfaceHighlight }]}>
                            <Ionicons name="download-outline" size={20} color={Colors.palette.success} />
                        </View>
                        <View style={styles.optionText}>
                            <Text style={styles.label}>Export Expenses (CSV)</Text>
                            <Text style={styles.subLabel}>Download usage report</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.palette.border} />
                    </TouchableOpacity>
                </View>

                {/* General */}
                <Text style={styles.sectionTitle}>General</Text>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.option} onPress={() => { }}>
                        <View style={[styles.iconBox, { backgroundColor: Colors.palette.surfaceHighlight }]}>
                            <Ionicons name="information-circle-outline" size={20} color={Colors.palette.primary} />
                        </View>
                        <View style={styles.optionText}>
                            <Text style={styles.label}>About App</Text>
                            <Text style={styles.subLabel}>v1.0.0 (Phase 5)</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.option, styles.logout]} onPress={handleLogout}>
                        <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                            <Ionicons name="log-out-outline" size={20} color={Colors.palette.danger} />
                        </View>
                        <Text style={[styles.label, { color: Colors.palette.danger }]}>Sign Out</Text>
                    </TouchableOpacity>
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
    header: {
        padding: Spacing.l,
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
    content: {
        padding: Spacing.l,
    },
    section: {
        backgroundColor: Colors.palette.surface,
        borderRadius: BorderRadius.l,
        padding: Spacing.m,
        marginBottom: Spacing.l,
        borderWidth: 1,
        borderColor: Colors.palette.surfaceHighlight,
        ...Shadows.soft,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.palette.textTertiary,
        marginBottom: Spacing.s,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.palette.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.soft,
    },
    avatarText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '700',
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.palette.textPrimary,
    },
    email: {
        color: Colors.palette.textSecondary,
        marginBottom: 4,
        fontSize: 14,
    },
    roleBadge: {
        backgroundColor: Colors.palette.surfaceHighlight,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BorderRadius.s,
        borderWidth: 1,
        borderColor: Colors.palette.border,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.palette.textSecondary,
        textTransform: 'uppercase',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.palette.surfaceHighlight,
    },
    logout: {
        borderBottomWidth: 0,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.m,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.m,
    },
    optionText: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.palette.textPrimary,
    },
    subLabel: {
        fontSize: 12,
        color: Colors.palette.textTertiary,
    }
});
