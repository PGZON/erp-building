import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SpendHistoryScreen() {
    const router = useRouter();
    const expenses = useQuery(api.expenses.getExpenses);
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        if (!expenses || expenses.length === 0) {
            Alert.alert("No Data", "No expenses to export.");
            return;
        }

        setExporting(true);
        try {
            // Generate HTML
            const html = `
                <html>
                <head>
                    <style>
                        body { font-family: Helvetica, sans-serif; padding: 20px; }
                        h1 { color: ${Colors.palette.primary}; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: ${Colors.palette.primaryLight}; color: ${Colors.palette.textPrimary}; }
                        tr:nth-child(even) { background-color: #f2f2f2; }
                        .amount { text-align: right; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>Expense Report</h1>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                    
                    <table>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Paid By</th>
                            <th>Amount</th>
                        </tr>
                        ${expenses.map(item => `
                            <tr>
                                <td>${new Date(item.date).toLocaleDateString()}</td>
                                <td>${item.title}</td>
                                <td>${item.category}</td>
                                <td>${item.paidBy}</td>
                                <td class="amount">₹${item.amount.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </table>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            Alert.alert("Export Error", "Failed to generate PDF");
        } finally {
            setExporting(false);
        }
    };

    // Group expenses by Month Year
    const sections = useMemo(() => {
        if (!expenses) return [];

        const grouped: Record<string, typeof expenses> = {};

        expenses.forEach(item => {
            const date = new Date(item.date);
            const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(item);
        });

        return Object.keys(grouped).map(key => ({
            title: key,
            data: grouped[key]
        }));
    }, [expenses]);

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        // @ts-ignore
        const catColor = Colors.palette.categories[item.category.toLowerCase()] || Colors.palette.categories.other;

        return (
            <TouchableOpacity
                style={[styles.itemContainer, index === 0 && { borderTopWidth: 0 }]}
                onPress={() => router.push(`/expenses/${item._id}`)}
                activeOpacity={0.7}
            >
                <View style={[styles.catIndicator, { backgroundColor: catColor }]} />
                <View style={styles.itemContent}>
                    <View style={styles.row}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemAmount}>- ₹{item.amount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString()} • {item.paidBy}</Text>
                        <View style={[styles.badge, { backgroundColor: catColor + '15' }]}>
                            <Text style={[styles.badgeText, { color: catColor }]}>{item.category}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.palette.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Spending History</Text>
                <TouchableOpacity onPress={handleExport} disabled={exporting}>
                    {exporting ? (
                        <ActivityIndicator size="small" color={Colors.palette.primary} />
                    ) : (
                        <Ionicons name="share-outline" size={24} color={Colors.palette.primary} />
                    )}
                </TouchableOpacity>
            </View>

            {!expenses ? (
                <ActivityIndicator size="large" color={Colors.palette.primary} style={{ marginTop: 50 }} />
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{title}</Text>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    stickySectionHeadersEnabled={false}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="time-outline" size={48} color={Colors.palette.textTertiary} />
                            <Text style={styles.emptyText}>No history available</Text>
                        </View>
                    }
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.l,
        backgroundColor: Colors.palette.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.palette.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.palette.textPrimary,
    },
    backBtn: {
        padding: 4,
    },
    listContent: {
        padding: Spacing.m,
        paddingBottom: Spacing.xxl,
    },
    sectionHeader: {
        paddingVertical: Spacing.m,
        marginBottom: Spacing.s,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.palette.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.palette.surface,
        borderRadius: BorderRadius.m,
        marginBottom: Spacing.s,
        overflow: 'hidden',
        ...Shadows.soft,
    },
    catIndicator: {
        width: 4,
        height: '100%',
    },
    itemContent: {
        flex: 1,
        padding: Spacing.m,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.palette.textPrimary,
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.palette.textPrimary,
    },
    itemDate: {
        fontSize: 12,
        color: Colors.palette.textTertiary,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: Spacing.m,
        color: Colors.palette.textTertiary,
        fontSize: 16,
    }
});
