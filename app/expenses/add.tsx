import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddExpenseScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const generateUploadUrl = useMutation(api.expenses.generateUploadUrl);
    const createExpense = useMutation(api.expenses.createExpense);

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [category, setCategory] = useState<'Material' | 'Labor' | 'Transport' | 'Other'>('Material');
    const [otherCategoryDesc, setOtherCategoryDesc] = useState('');
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const pickImages = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: 5, // Reasonable limit
            quality: 0.8,
            allowsEditing: false, // Disabled cropping as requested
        });

        if (!result.canceled) {
            setImages([...images, ...result.assets.map(asset => asset.uri)]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleSave = async () => {
        if (!title || !amount || !paidBy) {
            Alert.alert("Error", "Please fill all required fields");
            return;
        }
        setLoading(true);
        try {
            let storageIds: string[] = [];

            // Upload all images
            if (images.length > 0) {
                for (const imgUri of images) {
                    const uploadUrl = await generateUploadUrl();
                    const response = await fetch(imgUri);
                    const blob = await response.blob();
                    const result = await fetch(uploadUrl, {
                        method: "POST",
                        headers: { "Content-Type": blob.type },
                        body: blob,
                    });
                    const { storageId } = await result.json();
                    storageIds.push(storageId);
                }
            }

            // Append explicit other category to notes if present
            const finalNotes = category === 'Other' && otherCategoryDesc
                ? `[Category Spec: ${otherCategoryDesc}] ${notes}`
                : notes;

            await createExpense({
                title,
                amount: parseFloat(amount),
                category,
                date: Date.now(),
                paidBy,
                notes: finalNotes,
                billStorageId: storageIds.length > 0 ? (storageIds as any) : undefined,
                userId: user!._id,
            });

            Alert.alert("Success", "Expense added successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (e: any) {
            Alert.alert("Error", e.message || "Failed to save expense");
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
                <Text style={styles.headerTitle}>Add Expense</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Cement Bags"
                        placeholderTextColor={Colors.palette.textTertiary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Amount (₹) <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        placeholderTextColor={Colors.palette.textTertiary}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.row}>
                        {['Material', 'Labor', 'Transport', 'Other'].map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.chip, category === cat && styles.chipActive]}
                                onPress={() => setCategory(cat as any)}
                            >
                                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {category === 'Other' && (
                        <TextInput
                            style={[styles.input, { marginTop: Spacing.s }]}
                            value={otherCategoryDesc}
                            onChangeText={setOtherCategoryDesc}
                            placeholder="Specify Other Category..."
                            placeholderTextColor={Colors.palette.textTertiary}
                        />
                    )}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Paid By <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={paidBy}
                        onChangeText={setPaidBy}
                        placeholder="Person Name"
                        placeholderTextColor={Colors.palette.textTertiary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Notes</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        placeholder="Additional details..."
                        placeholderTextColor={Colors.palette.textTertiary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Bills / Receipts</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScroll}>
                        {images.map((img, index) => (
                            <View key={index} style={styles.imagePreviewContainer}>
                                <Image source={{ uri: img }} style={styles.previewImage} />
                                <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                                    <Ionicons name="close-circle" size={24} color={Colors.palette.danger} />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.uploadBox} onPress={pickImages}>
                            <View style={styles.uploadIconCircle}>
                                <Ionicons name="camera" size={24} color={Colors.palette.primary} />
                            </View>
                            <Text style={styles.uploadText}>{images.length > 0 ? "Add More" : "Attach Receipts"}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Expense</Text>}
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
    imageScroll: {
        gap: Spacing.m,
        paddingRight: Spacing.m,
    },
    imagePreviewContainer: {
        width: 120,
        height: 160,
        borderRadius: BorderRadius.m,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.m,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    uploadBox: {
        width: 120,
        height: 160,
        borderWidth: 2,
        borderColor: Colors.palette.border,
        borderStyle: 'dashed',
        borderRadius: BorderRadius.l,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.palette.surfaceHighlight,
    },
    uploadIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.palette.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    uploadText: {
        color: Colors.palette.textSecondary,
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
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
