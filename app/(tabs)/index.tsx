import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { useCallback, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const { user } = useAuth();
  const stats = useQuery(api.stats.getDashboardStats);
  const activities = useQuery(api.stats.getRecentActivity, { limit: 10 });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const chartData = stats ? [
    { name: 'Mat', population: stats.categoryTotals.Material, color: Colors.palette.primary, legendFontColor: Colors.palette.textSecondary, legendFontSize: 12 },
    { name: 'Lab', population: stats.categoryTotals.Labor, color: Colors.palette.accent, legendFontColor: Colors.palette.textSecondary, legendFontSize: 12 },
    { name: 'Trans', population: stats.categoryTotals.Transport, color: Colors.palette.warning, legendFontColor: Colors.palette.textSecondary, legendFontSize: 12 },
    { name: 'Oth', population: stats.categoryTotals.Other, color: Colors.palette.textTertiary, legendFontColor: Colors.palette.textSecondary, legendFontSize: 12 },
  ].filter(i => i.population > 0) : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}</Text>
          <Text style={styles.subtitle}>{user?.role} Access</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="person-circle-outline" size={32} color={Colors.palette.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.card, styles.totalCard]}>
            <View style={styles.iconBg}>
              <Ionicons name="wallet-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.cardLabel}>Total Spent</Text>
            <Text style={styles.cardValue}>
              ₹{stats?.totalSpent.toLocaleString() ?? '—'}
            </Text>
          </View>
          <View style={[styles.card, styles.monthlyCard]}>
            <View style={[styles.iconBg, { backgroundColor: Colors.palette.surfaceHighlight }]}>
              <Ionicons name="calendar-outline" size={24} color={Colors.palette.accent} />
            </View>
            <Text style={[styles.cardLabel, { color: Colors.palette.textSecondary }]}>This Month</Text>
            <Text style={[styles.cardValue, { color: Colors.palette.accent }]}>
              ₹{stats?.monthlySpent.toLocaleString() ?? '—'}
            </Text>
          </View>
        </View>

        {/* Quick Counts */}
        <View style={styles.row}>
          <View style={styles.miniCard}>
            <Text style={styles.miniValue}>{stats?.materialsCount ?? '-'}</Text>
            <Text style={styles.miniLabel}>Materials</Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.miniValue}>{stats?.vendorsCount ?? '-'}</Text>
            <Text style={styles.miniLabel}>Vendors</Text>
          </View>
        </View>

        {/* Chart */}
        {chartData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Spending Breakdown</Text>
            <PieChart
              data={chartData}
              width={screenWidth - 48}
              height={220}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"0"}
              center={[10, 0]}
              absolute
            />
          </View>
        )}

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {activities?.map((log, index) => (
            <View key={log._id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.line, index === activities.length - 1 && { height: 10 }]} />
                <View style={styles.dot} />
              </View>
              <View style={[styles.timelineContent, index === activities.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.actionText}>{log.details}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.userText}>{log.userName}</Text>
                  <Text style={styles.timeText}>{new Date(log.timestamp).toLocaleDateString()}</Text>
                </View>
              </View>
            </View>
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.palette.border,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.palette.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.palette.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  profileBtn: {
    padding: 4,
    backgroundColor: Colors.palette.surfaceHighlight,
    borderRadius: BorderRadius.pill,
  },
  content: {
    padding: Spacing.l,
    paddingBottom: Spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.m,
    marginBottom: Spacing.l,
  },
  card: {
    flex: 1,
    borderRadius: BorderRadius.l,
    padding: Spacing.m,
    alignItems: 'flex-start',
    ...Shadows.soft,
  },
  totalCard: {
    backgroundColor: Colors.palette.primary,
  },
  monthlyCard: {
    backgroundColor: Colors.palette.surface,
    borderWidth: 1,
    borderColor: Colors.palette.border,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.m,
    marginBottom: Spacing.l,
  },
  miniCard: {
    flex: 1,
    backgroundColor: Colors.palette.surface,
    padding: Spacing.m,
    borderRadius: BorderRadius.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.palette.border,
    ...Shadows.soft,
  },
  miniValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.palette.textPrimary,
  },
  miniLabel: {
    fontSize: 12,
    color: Colors.palette.textSecondary,
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: Colors.palette.surface,
    borderRadius: BorderRadius.l,
    padding: Spacing.m,
    marginBottom: Spacing.l,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.palette.border,
    ...Shadows.soft,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.m,
    alignSelf: 'flex-start',
    color: Colors.palette.textPrimary,
    letterSpacing: -0.5,
  },
  timelineSection: {
    backgroundColor: Colors.palette.surface,
    borderRadius: BorderRadius.l,
    padding: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.palette.border,
    ...Shadows.soft,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.m,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: Spacing.m,
    width: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.palette.accent,
    marginTop: 6,
    zIndex: 1,
    borderWidth: 2,
    borderColor: Colors.palette.surface,
  },
  line: {
    position: 'absolute',
    top: 6,
    bottom: -20,
    width: 2,
    backgroundColor: Colors.palette.surfaceHighlight,
    zIndex: 0,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: Spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.palette.surfaceHighlight,
  },
  actionText: {
    fontSize: 14,
    color: Colors.palette.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.palette.textSecondary,
  },
  timeText: {
    fontSize: 12,
    color: Colors.palette.textTertiary,
  },
});
