import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // Stats & Data
  const stats = useQuery(api.stats.getDashboardStats);
  const activities = useQuery(api.stats.getRecentActivity, { limit: 10 });

  // Calendar & Modal State
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewingMonth, setViewingMonth] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });

  // Fetch monthly data for "dots"
  const monthlyActivity = useQuery(api.stats.getExpensesByMonth, { month: viewingMonth.month, year: viewingMonth.year });

  // Fetch daily data when date selected
  const dailyExpenses = useQuery(api.stats.getExpensesForDay, selectedDate ? { dateString: selectedDate } : "skip");

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Prepare Chart Data
  const chartData = stats ? [
    // @ts-ignore
    { name: 'Mat', population: stats.categoryTotals.Material, color: Colors.palette.categories.material, legendFontColor: Colors.palette.textSecondary, legendFontSize: 12 },
    // @ts-ignore
    { name: 'Lab', population: stats.categoryTotals.Labor, color: Colors.palette.categories.labor, legendFontColor: Colors.palette.textSecondary, legendFontSize: 12 },
    // @ts-ignore
    { name: 'Trans', population: stats.categoryTotals.Transport, color: Colors.palette.categories.transport, legendFontColor: Colors.palette.textSecondary, legendFontSize: 12 },
    // @ts-ignore
    { name: 'Oth', population: stats.categoryTotals.Other, color: Colors.palette.categories.other, legendFontColor: Colors.palette.textSecondary, legendFontSize: 12 },
  ].filter(i => i.population > 0) : [];

  // Mark dates with activity
  const markedDates = monthlyActivity ? Object.keys(monthlyActivity).reduce((acc: any, date) => {
    acc[date] = {
      marked: true,
      dotColor: Colors.palette.accent,
      customStyles: {
        container: {
          backgroundColor: Colors.palette.surface,
          elevation: 2
        },
        text: {
          color: Colors.palette.textPrimary,
          fontWeight: 'bold'
        }
      }
    };
    return acc;
  }, {}) : {};

  // Highlight selected date
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: Colors.palette.primary,
      customStyles: {
        container: {
          backgroundColor: Colors.palette.primary,
          elevation: 4
        },
        text: {
          color: '#fff',
          fontWeight: 'bold'
        }
      }
    };
  }

  const handleMonthChange = (date: DateData) => {
    setViewingMonth({ month: date.month - 1, year: date.year });
  };

  // Category Breakdown List Data (Sorted by spend)
  const breakdownData = stats ? [
    { label: 'Materials', amount: stats.categoryTotals.Material, color: Colors.palette.categories.material, icon: 'cube-outline' },
    { label: 'Labor', amount: stats.categoryTotals.Labor, color: Colors.palette.categories.labor, icon: 'people-outline' },
    { label: 'Transport', amount: stats.categoryTotals.Transport, color: Colors.palette.categories.transport, icon: 'car-outline' },
    { label: 'Other', amount: stats.categoryTotals.Other, color: Colors.palette.categories.other, icon: 'ellipsis-horizontal-circle-outline' },
  ].sort((a, b) => b.amount - a.amount) : [];

  const maxSpend = Math.max(...breakdownData.map(d => d.amount), 1);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name?.split(' ')[0]}</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Cards Section */}
        <View style={styles.heroSection}>
          {/* Primary Card - Violet */}
          <TouchableOpacity
            style={[styles.card, styles.primaryCard]}
            onPress={() => router.push('/expenses/history')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="wallet" size={20} color="#fff" />
              </View>
              <Text style={styles.cardLabel}>Total Spend</Text>
            </View>
            <Text style={styles.cardValue}>₹{stats?.totalSpent.toLocaleString() ?? '0'}</Text>
            <View style={styles.tapHint}>
              <Text style={[styles.tapHintText, { color: 'rgba(255,255,255,0.7)' }]}>View History</Text>
              <Ionicons name="arrow-forward" size={12} color="rgba(255,255,255,0.7)" />
            </View>
          </TouchableOpacity>

          {/* Monthly Card - Amber Accent */}
          <TouchableOpacity
            style={[styles.card, styles.secondaryCard]}
            onPress={() => setCalendarVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.palette.accent + '20' }]}>
                <Ionicons name="calendar" size={20} color={Colors.palette.accent} />
              </View>
              <Text style={[styles.cardLabel, { color: Colors.palette.textSecondary }]}>This Month</Text>
            </View>
            <Text style={[styles.cardValue, { color: Colors.palette.accent }]}>
              ₹{stats?.monthlySpent.toLocaleString() ?? '0'}
            </Text>
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>View Archive</Text>
              <Ionicons name="arrow-forward" size={12} color={Colors.palette.accent} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Grid - Navigation Links */}
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={[styles.statBox, { borderLeftWidth: 4, borderLeftColor: Colors.palette.categories.material }]}
            onPress={() => router.push('/(tabs)/materials')} // Go to Materials Tab
          >
            <Text style={[styles.statNumber, { color: Colors.palette.categories.material }]}>{stats?.materialsCount ?? 0}</Text>
            <Text style={styles.statLabel}>Materials</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statBox, { borderLeftWidth: 4, borderLeftColor: Colors.palette.categories.labor }]}
            onPress={() => router.push('/vendors')} // Go to Vendors List
          >
            <Text style={[styles.statNumber, { color: Colors.palette.categories.labor }]}>{stats?.vendorsCount ?? 0}</Text>
            <Text style={styles.statLabel}>Vendors</Text>
          </TouchableOpacity>
        </View>

        {/* Overview Redesign: Category Breakdown List */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pie-chart-outline" size={20} color={Colors.palette.textSecondary} />
            <Text style={styles.sectionTitle}>Spend Breakdown</Text>
          </View>

          <View style={styles.breakdownList}>
            {breakdownData.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={[styles.catIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <View style={styles.breakdownContent}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>{item.label}</Text>
                    <Text style={styles.breakdownAmount}>₹{item.amount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${(item.amount / maxSpend) * 100}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash-outline" size={20} color={Colors.palette.textSecondary} />
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>

          {activities?.map((log, index) => (
            <View key={log._id} style={styles.activityItem}>
              <View style={styles.timelineLine} />
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{log.details}</Text>
                <View style={styles.activityMeta}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>{log.userName}</Text>
                  </View>
                  <Text style={styles.metaTime}>{new Date(log.timestamp).toLocaleDateString()}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Calendar 'Archive' Modal */}
      <Modal visible={calendarVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          {/* Custom Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Archive</Text>
              <Text style={styles.modalSubtitle}>Review past expenses by date</Text>
            </View>
            <TouchableOpacity onPress={() => setCalendarVisible(false)} style={styles.closeBtnCircle}>
              <Ionicons name="close" size={24} color={Colors.palette.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            <Calendar
              style={styles.calendar}
              theme={{
                backgroundColor: Colors.palette.background,
                calendarBackground: Colors.palette.surface,
                textSectionTitleColor: Colors.palette.textSecondary,
                selectedDayBackgroundColor: Colors.palette.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: Colors.palette.accent,
                dayTextColor: Colors.palette.textPrimary,
                textDisabledColor: Colors.palette.border,
                dotColor: Colors.palette.accent,
                selectedDotColor: '#ffffff',
                arrowColor: Colors.palette.primary,
                monthTextColor: Colors.palette.primaryDark,
                indicatorColor: Colors.palette.primary,
                textDayFontWeight: '600',
                textMonthFontWeight: '800',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 20,
                textDayHeaderFontSize: 12
              }}
              onMonthChange={handleMonthChange}
              onDayPress={(day: any) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              markingType={'custom'}
              enableSwipeMonths={true}
            />

            <View style={styles.modalContent}>
              <View style={styles.selectedDateHeader}>
                <Text style={styles.dayTitle}>
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
                    : 'Select a Date'}
                </Text>
                {dailyExpenses && dailyExpenses.length > 0 && (
                  <View style={styles.dayTotalBadge}>
                    <Text style={styles.dayTotalText}>
                      ₹{dailyExpenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>

              {!dailyExpenses && selectedDate && <ActivityIndicator color={Colors.palette.primary} style={{ marginTop: 20 }} />}

              {dailyExpenses && dailyExpenses.length === 0 && selectedDate && (
                <View style={styles.emptyDayContainer}>
                  <Ionicons name="sunny-outline" size={48} color={Colors.palette.textTertiary} />
                  <Text style={styles.emptyText}>No expenses recorded for this day.</Text>
                </View>
              )}

              {!selectedDate && (
                <View style={styles.emptyDayContainer}>
                  <Ionicons name="calendar-outline" size={48} color={Colors.palette.primaryLight} />
                  <Text style={styles.emptyText}>Tap a date above to view details</Text>
                </View>
              )}

              <View style={{ gap: Spacing.s }}>
                {dailyExpenses?.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    style={styles.dailyItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setCalendarVisible(false);
                      router.push(`/expenses/${item._id}`);
                    }}
                  >
                    <View style={[styles.dailyIcon, { backgroundColor: (Colors.palette.categories as any)[item.category.toLowerCase()] + '20' }]}>
                      <Ionicons
                        name={
                          item.category === 'Material' ? 'cube' :
                            item.category === 'Labor' ? 'people' :
                              item.category === 'Transport' ? 'car' : 'ellipsis-horizontal-circle'
                        }
                        size={20}
                        color={(Colors.palette.categories as any)[item.category.toLowerCase()]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dailyTitle}>{item.title}</Text>
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        <View style={[styles.miniBadge, { backgroundColor: (Colors.palette.categories as any)[item.category.toLowerCase()] + '20' }]}>
                          <Text style={[styles.miniBadgeText, { color: (Colors.palette.categories as any)[item.category.toLowerCase()] }]}>{item.category}</Text>
                        </View>
                        <Text style={styles.dailyPaidBy} numberOfLines={1}>• {item.paidBy}</Text>
                      </View>
                    </View>
                    <Text style={styles.dailyAmount}>- ₹{item.amount.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: Colors.palette.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.palette.textPrimary,
    letterSpacing: -0.5,
  },
  profileBtn: {
    ...Shadows.soft,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.palette.surfaceHighlight,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.palette.primary,
  },
  content: {
    padding: Spacing.l,
    gap: Spacing.l,
    paddingBottom: 100,
  },
  heroSection: {
    flexDirection: 'row',
    gap: Spacing.m,
  },
  card: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.m,
    justifyContent: 'space-between',
    height: 140,
    ...Shadows.medium,
  },
  primaryCard: {
    backgroundColor: Colors.palette.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  secondaryCard: {
    backgroundColor: Colors.palette.surface,
    borderWidth: 1,
    borderColor: Colors.palette.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginVertical: Spacing.s,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tapHintText: {
    fontSize: 10,
    color: Colors.palette.textTertiary,
    fontWeight: '600',
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.m,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.palette.surface,
    borderRadius: BorderRadius.l,
    padding: Spacing.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.palette.surfaceHighlight,
    ...Shadows.soft,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.palette.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.palette.textSecondary,
    marginTop: 4,
  },
  sectionContainer: {
    backgroundColor: Colors.palette.surface,
    borderRadius: BorderRadius.l,
    padding: Spacing.m,
    ...Shadows.soft,
    borderWidth: 1,
    borderColor: Colors.palette.surfaceHighlight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    marginBottom: Spacing.m,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.palette.textPrimary,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: Spacing.m,
    position: 'relative',
    paddingLeft: Spacing.l,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 8,
    bottom: -20,
    width: 2,
    backgroundColor: Colors.palette.surfaceHighlight,
  },
  activityDot: {
    position: 'absolute',
    left: 0,
    top: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.palette.primary,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1,
  },
  activityContent: {
    flex: 1,
    marginLeft: Spacing.s,
  },
  activityText: {
    fontSize: 14,
    color: Colors.palette.textPrimary,
    fontWeight: '500',
    lineHeight: 20,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: Spacing.s,
    alignItems: 'center',
    marginTop: 4,
  },
  metaBadge: {
    backgroundColor: Colors.palette.surfaceHighlight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.palette.textSecondary,
  },
  metaTime: {
    fontSize: 12,
    color: Colors.palette.textTertiary,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.palette.background,
  },
  modalHeader: {
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.palette.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.palette.textPrimary,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.palette.textSecondary,
    fontWeight: '500',
  },
  closeBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.palette.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendar: {
    marginBottom: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.palette.border,
    paddingBottom: Spacing.s,
  },
  modalContent: {
    paddingHorizontal: Spacing.m,
    paddingBottom: 40,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.m,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.palette.textPrimary,
  },
  dayTotalBadge: {
    backgroundColor: Colors.palette.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
  },
  dayTotalText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.palette.primary,
  },
  emptyDayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: Spacing.m,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.palette.textTertiary,
    textAlign: 'center',
  },
  dailyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.palette.surface,
    padding: Spacing.m,
    borderRadius: BorderRadius.l,
    ...Shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  dailyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  dailyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.palette.textPrimary,
    marginBottom: 2,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dailyPaidBy: {
    fontSize: 12,
    color: Colors.palette.textSecondary,
    maxWidth: 100,
  },
  dailyAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.palette.textPrimary,
  },
  // Breakdown styles
  breakdownList: {
    gap: Spacing.m,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  breakdownContent: {
    flex: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.palette.textPrimary,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.palette.textPrimary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.palette.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
