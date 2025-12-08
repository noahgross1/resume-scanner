import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { signUp } from "@/utils/supabaseClient";

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Register">;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all fields");
      return false;
    }

    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters long"
      );
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { user, error } = await signUp(email, password);

      if (error) {
        if (error.message.includes("already registered")) {
          Alert.alert(
            "Account Exists",
            "This email is already registered. Please sign in instead.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Go to Sign In",
                onPress: () => navigation.navigate("Login"),
              },
            ]
          );
        } else {
          Alert.alert("Registration Failed", error.message);
        }
      } else if (user) {
        Alert.alert(
          "Success!",
          "Account created successfully. Please check your email to verify your account.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="user-plus" size={32} color={theme.link} />
          </View>
          <Spacer height={Spacing.lg} />
          <ThemedText type="h1" style={styles.title}>
            Create Account
          </ThemedText>
          <ThemedText secondary style={styles.subtitle}>
            Sign up to start your job search journey
          </ThemedText>
        </View>

        <Spacer height={Spacing["2xl"]} />

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <ThemedText type="small" style={styles.label}>
            Email
          </ThemedText>
          <Spacer height={Spacing.xs} />
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <Feather
              name="mail"
              size={20}
              color={theme.textTertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="you@example.com"
              placeholderTextColor={theme.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>
        </View>

        <Spacer height={Spacing.lg} />

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <ThemedText type="small" style={styles.label}>
            Password
          </ThemedText>
          <Spacer height={Spacing.xs} />
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <Feather
              name="lock"
              size={20}
              color={theme.textTertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="At least 6 characters"
              placeholderTextColor={theme.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password-new"
              textContentType="newPassword"
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={theme.textTertiary}
              />
            </Pressable>
          </View>
        </View>

        <Spacer height={Spacing.lg} />

        {/* Confirm Password Input */}
        <View style={styles.inputGroup}>
          <ThemedText type="small" style={styles.label}>
            Confirm Password
          </ThemedText>
          <Spacer height={Spacing.xs} />
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <Feather
              name="lock"
              size={20}
              color={theme.textTertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Re-enter your password"
              placeholderTextColor={theme.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoComplete="password-new"
              textContentType="newPassword"
            />
            <Pressable
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.passwordToggle}
            >
              <Feather
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color={theme.textTertiary}
              />
            </Pressable>
          </View>
        </View>

        <Spacer height={Spacing.md} />

        {/* Password Requirements */}
        <View
          style={[
            styles.requirementsContainer,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather name="info" size={16} color={theme.textSecondary} />
          <ThemedText
            secondary
            type="caption"
            style={styles.requirementsText}
          >
            Password must be at least 6 characters
          </ThemedText>
        </View>

        <Spacer height={Spacing["2xl"]} />

        {/* Register Button */}
        <Button onPress={handleRegister} loading={loading}>
          Create Account
        </Button>

        <Spacer height={Spacing.xl} />

        {/* Terms */}
        <ThemedText tertiary type="caption" style={styles.terms}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </ThemedText>

        <Spacer height={Spacing.lg} />

        {/* Login Link */}
        <View style={styles.footer}>
          <ThemedText secondary type="body">
            Already have an account?{" "}
          </ThemedText>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <ThemedText
              style={[styles.link, { color: theme.link }]}
              type="body"
            >
              Sign In
            </ThemedText>
          </Pressable>
        </View>

        <Spacer height={Spacing.xl} />
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing["2xl"],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  inputGroup: {
    width: "100%",
  },
  label: {
    fontWeight: "600",
    marginLeft: Spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  passwordToggle: {
    padding: Spacing.xs,
  },
  requirementsContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  requirementsText: {
    flex: 1,
  },
  terms: {
    textAlign: "center",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    fontWeight: "600",
  },
});

