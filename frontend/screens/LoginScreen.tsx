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
import { signInWithEmail } from "@/utils/supabaseClient";

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Login">;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const { user, error } = await signInWithEmail(email, password);

      if (error) {
        Alert.alert(
          "Login Failed",
          error.message || "Invalid email or password"
        );
      } else if (user) {
        // Successfully logged in - navigation will be handled by auth state
        console.log("Successfully logged in:", user.email);
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
            <Feather name="briefcase" size={32} color={theme.link} />
          </View>
          <Spacer height={Spacing.lg} />
          <ThemedText type="h1" style={styles.title}>
            Welcome Back
          </ThemedText>
          <ThemedText secondary style={styles.subtitle}>
            Sign in to continue job hunting
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
              placeholder="••••••••"
              placeholderTextColor={theme.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
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

        <Spacer height={Spacing.md} />

        {/* Forgot Password */}
        <Pressable
          onPress={() =>
            Alert.alert(
              "Reset Password",
              "Password reset feature coming soon!"
            )
          }
        >
          <ThemedText
            style={[styles.forgotPassword, { color: theme.link }]}
            type="small"
          >
            Forgot password?
          </ThemedText>
        </Pressable>

        <Spacer height={Spacing["2xl"]} />

        {/* Login Button */}
        <Button onPress={handleLogin} loading={loading}>
          Sign In
        </Button>

        <Spacer height={Spacing.xl} />

        {/* Register Link */}
        <View style={styles.footer}>
          <ThemedText secondary type="body">
            Don't have an account?{" "}
          </ThemedText>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <ThemedText
              style={[styles.link, { color: theme.link }]}
              type="body"
            >
              Sign Up
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
  forgotPassword: {
    textAlign: "right",
    fontWeight: "500",
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

