import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddVendorScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const createVendor = useMutation(api.vendors.createVendor);

    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [type, setType] = useState<'Supplier' | 'Contractor' | 'Service' | 'Other'>('Supplier');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name) {
            Alert.alert("Error", "Name is required");
            return;
        }

        setLoading(true);
        try {
            await createVendor({
                name,
                contact,
                type,
                notes,
                userId: user!._id,
            });

            Alert.alert("Success", "Vendor added successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);

        } catch (e: any) {
            Alert.alert("Error", e.message || "Failed to save vendor");
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
                <Text style={styles.headerTitle}>Add Vendor</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Vendor Name <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. ABC Hardware"
                        placeholderTextColor={Colors.palette.textTertiary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Contact Info</Text>
                    <TextInput
                        style={styles.input}
                        value={contact}
                        onChangeText={setContact}
                        placeholder="Phone or Email"
                        placeholderTextColor={Colors.palette.textTertiary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Type</Text>
                    <View style={styles.row}>
                        {['Supplier', 'Contractor', 'Service', 'Other'].map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.chip, type === t && styles.chipActive]}
                                onPress={() => setType(t as any)}
                            >
                                <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Notes</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        placeholder="Address or other details..."
                        placeholderTextColor={Colors.palette.textTertiary}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Vendor</Text>}
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.s,
    },
    chip: {
        paddingHorizontal: Spacing.m,
        paddingVertical: 10,
        borderRadius: BorderRadius.pill,
        backgroundColor: Colors.palette.surfaceHighlight,
        borderWidth: 1,
        borderColor: Colors.palette.border,
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
