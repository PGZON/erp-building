import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddMaterialScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const createMaterial = useMutation(api.materials.createMaterial);
    const vendors = useQuery(api.vendors.getVendors) || [];

    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [cost, setCost] = useState('');
    const [vendorId, setVendorId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !quantity || !unit || !cost) {
            Alert.alert("Error", "Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            await createMaterial({
                name,
                quantity: parseFloat(quantity),
                unit,
                cost: parseFloat(cost),
                date: Date.now(),
                vendorId: vendorId as any,
                userId: user!._id,
            });

            Alert.alert("Success", "Material added successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);

        } catch (e: any) {
            Alert.alert("Error", e.message || "Failed to save material");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.palette.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Material</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Material Name <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Cement"
                        placeholderTextColor={Colors.palette.textTertiary}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Quantity <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            value={quantity}
                            onChangeText={setQuantity}
                            placeholder="100"
                            placeholderTextColor={Colors.palette.textTertiary}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Unit <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            value={unit}
                            onChangeText={setUnit}
                            placeholder="bags/kg"
                            placeholderTextColor={Colors.palette.textTertiary}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Total Cost (₹) <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={cost}
                        onChangeText={setCost}
                        placeholder="0.00"
                        placeholderTextColor={Colors.palette.textTertiary}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Supplier / Vendor</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vendorList}>
                        {vendors.map((v) => (
                            <TouchableOpacity
                                key={v._id}
                                style={[styles.chip, vendorId === v._id && styles.chipActive]}
                                onPress={() => setVendorId(v._id === vendorId ? null : v._id)}
                            >
                                <Text style={[styles.chipText, vendorId === v._id && styles.chipTextActive]}>{v.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Material</Text>}
                </TouchableOpacity>

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
        fontSize: 20,
        fontWeight: '700',
        color: Colors.palette.textPrimary,
    },
    form: {
        padding: Spacing.l,
        gap: Spacing.l,
    },
    inputGroup: {
        gap: Spacing.s,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.palette.textPrimary,
    },
    required: {
        color: Colors.palette.danger,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.palette.border,
        borderRadius: BorderRadius.m,
        padding: Spacing.m,
        fontSize: 16,
        backgroundColor: Colors.palette.surface,
        color: Colors.palette.textPrimary,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.m,
    },
    vendorList: {
        flexDirection: 'row',
        paddingVertical: 4,
    },
    chip: {
        paddingHorizontal: Spacing.m,
        paddingVertical: 10,
        borderRadius: BorderRadius.pill,
        backgroundColor: Colors.palette.surfaceHighlight,
        borderWidth: 1,
        borderColor: Colors.palette.border,
        marginRight: 8,
    },
    chipActive: {
        backgroundColor: Colors.palette.primary,
        borderColor: Colors.palette.primary,
    },
    chipText: {
        color: Colors.palette.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    chipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: Colors.palette.primary,
        padding: Spacing.m,
        borderRadius: BorderRadius.m,
        alignItems: 'center',
        marginTop: Spacing.s,
        ...Shadows.medium,
    },
    disabled: {
        opacity: 0.7,
    },
    saveText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
