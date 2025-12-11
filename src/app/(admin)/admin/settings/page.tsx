"use client"

import { Plus, Users, Monitor, Sun, Moon, Palette, RotateCcw, Construction } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useTheme, colorSchemes } from "@/providers/ThemeProvider"

export default function SettingsPage() {
  const { settings: themeSettings, updateSetting: updateThemeSetting, resetToDefaults } = useTheme()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your platform settings and preferences
          </p>
        </div>
        {/* <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button> */}
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 relative min-h-[600px]">
          {/* Under Construction Overlay */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10 min-h-full">
            <div className="text-center p-8 bg-card border rounded-lg shadow-lg max-w-md mx-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Construction className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Under Construction</h3>
              <p className="text-muted-foreground text-sm">
                This section is currently being developed. Please check back later for updates.
              </p>
            </div>
          </div>
          
          {/* Current Admin User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Profile</CardTitle>
              <CardDescription>
                Information about the currently signed-in admin user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Admin User</h3>
                  <p className="text-sm text-muted-foreground">admin@bluff.com</p>
                  <p className="text-sm text-muted-foreground">Super Administrator</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Last Login</Label>
                  <p className="font-medium">Today, 2:30 PM</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Account Created</Label>
                  <p className="font-medium">January 15, 2024</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Sessions</Label>
                  <p className="font-medium">127</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium text-green-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage admin users and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Role</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Last Login</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="h-12 px-4 align-middle">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">AU</span>
                            </div>
                            <span className="font-medium">Admin User</span>
                          </div>
                        </td>
                        <td className="h-12 px-4 align-middle">admin@bluff.com</td>
                        <td className="h-12 px-4 align-middle">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            Super Admin
                          </span>
                        </td>
                        <td className="h-12 px-4 align-middle">
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        </td>
                        <td className="h-12 px-4 align-middle text-sm text-muted-foreground">
                          Today, 2:30 PM
                        </td>
                        <td className="h-12 px-4 align-middle">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="h-12 px-4 align-middle">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-purple-700">JD</span>
                            </div>
                            <span className="font-medium">John Doe</span>
                          </div>
                        </td>
                        <td className="h-12 px-4 align-middle">john.doe@bluff.com</td>
                        <td className="h-12 px-4 align-middle">
                          <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                            Admin
                          </span>
                        </td>
                        <td className="h-12 px-4 align-middle">
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        </td>
                        <td className="h-12 px-4 align-middle text-sm text-muted-foreground">
                          Yesterday, 4:15 PM
                        </td>
                        <td className="h-12 px-4 align-middle">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="h-12 px-4 align-middle">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-orange-700">JS</span>
                            </div>
                            <span className="font-medium">Jane Smith</span>
                          </div>
                        </td>
                        <td className="h-12 px-4 align-middle">jane.smith@bluff.com</td>
                        <td className="h-12 px-4 align-middle">
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
                            Moderator
                          </span>
                        </td>
                        <td className="h-12 px-4 align-middle">
                          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
                            Inactive
                          </span>
                        </td>
                        <td className="h-12 px-4 align-middle text-sm text-muted-foreground">
                          3 days ago
                        </td>
                        <td className="h-12 px-4 align-middle">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing 3 of 3 admin users
                </p>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Admin User
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of your platform
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Defaults
              </Button>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Theme Selection */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme mode
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Monitor },
                  ].map(({ value, label, icon: Icon }) => (
                    <Card
                      key={value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        themeSettings.theme === value
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-muted-foreground/50"
                      }`}
                      onClick={() => updateThemeSetting("theme", value as "light" | "dark" | "system")}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <Icon className="h-8 w-8 mb-2" />
                        <span className="font-medium">{label}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Color Scheme */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Primary Color</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your brand color scheme
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(colorSchemes).map(([key, colors]) => (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        themeSettings.primaryColor === key
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-muted-foreground/50"
                      }`}
                      onClick={() => updateThemeSetting("primaryColor", key as "blue" | "purple" | "green" | "orange" | "red" | "pink")}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4">
                        <div className="flex gap-1 mb-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: colors.primary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: colors.secondary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: colors.accent }}
                          />
                        </div>
                        <span className="font-medium capitalize">{key}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}