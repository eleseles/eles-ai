import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send, Loader2, Share } from "lucide-react-native";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Sharing from "expo-sharing";

import Colors from "@/constants/colors";
import { useEmbroidery } from "@/context/embroidery";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUri?: string;
  timestamp: number;
}

export default function EditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { results, addResult } = useEmbroidery();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const result = results.find((r) => r.id === id);

  useEffect(() => {
    if (result) {
      setCurrentImage(result.imageUri);
      setMessages([
        {
          id: "initial",
          role: "assistant",
          content: "I'm ready to help you edit this embroidery pattern. Tell me what changes you'd like to make!",
          imageUri: result.imageUri,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [result]);

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing || !currentImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);

    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const apiResponse = await fetch("https://toolkit.rork.com/images/edit/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: inputText.trim(),
          images: [{ type: "image", image: base64.split(",")[1] }],
          aspectRatio: "1:1",
        }),
      });

      if (!apiResponse.ok) {
        throw new Error("Failed to edit image");
      }

      const data = await apiResponse.json();
      const editedUri = `data:${data.image.mimeType};base64,${data.image.base64Data}`;

      setCurrentImage(editedUri);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I've updated the image based on your request. What else would you like to change?",
        imageUri: editedUri,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (result) {
        addResult({
          id: Date.now().toString(),
          imageUri: editedUri,
          style: result.style,
          timestamp: Date.now(),
          originalImageUri: result.originalImageUri,
        });
      }

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error editing image:", error);
      Alert.alert("Error", "Failed to edit the image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!currentImage) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(currentImage, {
          dialogTitle: "Save or share your embroidery pattern",
        });
      } else {
        Alert.alert("Not Available", "Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Error sharing image:", error);
      Alert.alert("Error", "Failed to share the image");
    }
  };

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Image not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text.primary} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.title}>Edit Pattern</Text>
              <Text style={styles.subtitle}>Refine with AI</Text>
            </View>
            <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
              <Share size={24} color={Colors.accent} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.role === "user" ? styles.userMessage : styles.assistantMessage,
                ]}
              >
                {message.imageUri && (
                  <View style={styles.messageImageContainer}>
                    <Image source={{ uri: message.imageUri }} style={styles.messageImage} contentFit="cover" />
                  </View>
                )}
                <View style={[
                  styles.messageBubble,
                  message.role === "user" ? styles.userBubble : styles.assistantBubble,
                ]}>
                  <Text style={[
                    styles.messageText,
                    message.role === "user" ? styles.userText : styles.assistantText,
                  ]}>
                    {message.content}
                  </Text>
                </View>
              </View>
            ))}
            {isProcessing && (
              <View style={[styles.messageContainer, styles.assistantMessage]}>
                <View style={styles.processingBubble}>
                  <ActivityIndicator size="small" color={Colors.accent} />
                  <Text style={styles.processingText}>Processing your request...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Describe the changes you want..."
              placeholderTextColor={Colors.text.muted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isProcessing}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isProcessing) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || isProcessing}
            >
              {isProcessing ? (
                <Loader2 size={24} color="#FFFFFF" strokeWidth={2} />
              ) : (
                <Send size={24} color="#FFFFFF" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  downloadButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 20,
    maxWidth: "85%",
  },
  userMessage: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  messageImageContainer: {
    width: 200,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 8,
    backgroundColor: Colors.surface,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  messageImage: {
    width: "100%",
    height: "100%",
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: "#FFFFFF",
  },
  assistantText: {
    color: Colors.text.primary,
  },
  processingBubble: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  processingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: "italic" as const,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: Colors.text.primary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: 100,
  },
});
