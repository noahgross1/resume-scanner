import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyJobsScreen from "@/screens/MyJobsScreen";
import JobDetailScreen from "@/screens/JobDetailScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type MyJobsStackParamList = {
  MyJobs: undefined;
  JobDetail: {
    jobId: string;
  };
};

const Stack = createNativeStackNavigator<MyJobsStackParamList>();

export default function MyJobsStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="MyJobs"
        component={MyJobsScreen}
        options={{ headerTitle: "My Jobs" }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{
          headerTitle: "Job Details",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
