import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SearchScreen from "@/screens/SearchScreen";
import JobResultsScreen from "@/screens/JobResultsScreen";
import JobDetailScreen from "@/screens/JobDetailScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type SearchStackParamList = {
  Search: undefined;
  JobResults: {
    resumeText?: string;
    jobTitle: string;
    location: string;
  };
  JobDetail: {
    jobId: string;
  };
};

const Stack = createNativeStackNavigator<SearchStackParamList>();

export default function SearchStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerTitle: () => <HeaderTitle title="JobMatch" />,
        }}
      />
      <Stack.Screen
        name="JobResults"
        component={JobResultsScreen}
        options={{ headerTitle: "Job Results" }}
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
