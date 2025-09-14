// src/pages/Settings.tsx
import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import type { User } from "firebase/auth";
import DarkModeToggle from "../components/DarkModeToggle"; 
import { auth, db } from "../firebase";
import { 
  doc, 
  setDoc, 
  serverTimestamp,
  onSnapshot 
} from "firebase/firestore";
import { 
  updateProfile,  
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from "firebase/auth";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Globe, 
  Clock, 
  DollarSign,
  Shield,
  Trash2,
  Save,
  Camera,
  Bell,
  Download,
} from "lucide-react";

interface Props {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

// Context type from Layout
interface OutletContext {
  setProfile: (profile: { name: string; avatar: string }) => void;
}

interface UserSettings {
  name: string;
  email: string;
  currency: string;
  phone: string;
  timezone: string;
  language: string;
  avatar: string;
  notifications: {
    email: boolean;
    push: boolean;
    budgetAlerts: boolean;
    monthlyReports: boolean;
  };
  privacy: {
    profileVisible: boolean;
    dataSharing: boolean;
  };
  budgetLimits: {
    monthly: number;
    daily: number;
    categoryLimits: Record<string, number>;
  };
  createdAt?: any;
  updatedAt?: any;
}

export default function Settings({ darkMode, setDarkMode }: Props) {
  const { setProfile } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Form states
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    email: "",
    currency: "NGN",
    phone: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "GMT+1",
    language: "English",
    avatar: "",
    notifications: {
      email: true,
      push: true,
      budgetAlerts: true,
      monthlyReports: false,
    },
    privacy: {
      profileVisible: true,
      dataSharing: false,
    },
    budgetLimits: {
      monthly: 0,
      daily: 0,
      categoryLimits: {},
    },
  });

  // UI states
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'data'>('profile');
  const [uploadingAvatar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Auth state management
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (!currentUser) {
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // Load user settings from Firestore with real-time updates
  useEffect(() => {
    if (!user?.uid || authLoading) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, "users", user.uid, "settings", "preferences");
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserSettings;
        setSettings(data);
        setProfile({ 
          name: data.name || user.displayName || "User", 
          avatar: data.avatar || "" 
        });
      } else {
        // Initialize with default settings if none exist
        const defaultSettings: UserSettings = {
          ...settings,
          name: user.displayName || "",
          email: user.email || "",
        };
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error loading settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, authLoading]);

  // Update settings field
  const updateSetting = (field: keyof UserSettings | string, value: any) => {
    setSettings(prev => {
      if (field.includes('.')) {
        // Handle nested objects like notifications.email
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof UserSettings] as object),
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Save settings to Firestore
  const handleSave = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const docRef = doc(db, "users", user.uid, "settings", "preferences");
      await setDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp(),
        createdAt: settings.createdAt || serverTimestamp(),
      }, { merge: true });

      // Update Firebase Auth profile if name changed
      if (settings.name !== user.displayName) {
        await updateProfile(user, { displayName: settings.name });
      }

      setProfile({ name: settings.name, avatar: settings.avatar });
      
      // Show success message (you might want to use a proper toast notification)
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle profile picture upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      updateSetting('avatar', result);
      setProfile({ name: settings.name, avatar: result });
    };
    reader.readAsDataURL(file);
  };

  // Change password
  const handlePasswordChange = async () => {
    if (!user?.email) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, passwordData.newPassword);
      
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Error updating password. Please check your current password.");
    }
  };

  // Export user data
  const handleExportData = async () => {
    if (!user?.uid) return;

    try {
      // You would implement this to gather all user data
      const userData = {
        settings,
        exportDate: new Date().toISOString(),
        userId: user.uid,
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error exporting data");
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!user || !passwordData.currentPassword) {
      alert("Please enter your current password to delete account");
      return;
    }

    try {
      // Reauthenticate
      const credential = EmailAuthProvider.credential(
        user.email!,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      // Delete user data from Firestore
      // You might want to implement a cloud function for this
      
      // Delete user account
      await deleteUser(user);
      
      alert("Account deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Error deleting account. Please try again.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading settings...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Please log in to access settings.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-400 dark:text-blue-300 mb-6">Settings</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b dark:border-gray-700">
          {[
            { id: 'profile', label: 'Profile', icon: UserIcon },
            { id: 'preferences', label: 'Preferences', icon: Globe },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'data', label: 'Data', icon: Download },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium ${
                activeTab === id
                  ? 'bg-blue-400 text-white dark:bg-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UserIcon size={20} />
                Profile Information
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24">
                  <img
                    src={settings.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(settings.name || 'User')}&size=96&background=60a5fa&color=fff`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-blue-400 dark:border-blue-300 object-cover"
                  />
                  <label
                    htmlFor="avatarUpload"
                    className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                      uploadingAvatar 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-400 dark:bg-blue-500 hover:bg-blue-500 dark:hover:bg-blue-400'
                    }`}
                  >
                    {uploadingAvatar ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera size={16} className="text-white" />
                    )}
                  </label>
                  <input
                    type="file"
                    id="avatarUpload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="font-medium">{settings.name || 'User'}</p>
                  <p className="text-sm text-gray-500">{settings.email}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex text-sm font-medium mb-2 items-center gap-2">
                    <UserIcon size={16} />
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => updateSetting('name', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="flex text-sm font-medium mb-2 items-center gap-2">
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting('email', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="flex text-sm font-medium mb-2  items-center gap-2">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => updateSetting('phone', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>

                <div>
                  <label className="flex text-sm font-medium mb-2 items-center gap-2">
                    <DollarSign size={16} />
                    Preferred Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    <option value="NGN">NGN (₦) - Nigerian Naira</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>
              </div>

              {/* Budget Limits */}
              <div>
                <h3 className="font-medium mb-3">Budget Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Monthly Budget Limit</label>
                    <input
                      type="number"
                      value={settings.budgetLimits.monthly}
                      onChange={(e) => updateSetting('budgetLimits.monthly', Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Daily Budget Limit</label>
                    <input
                      type="number"
                      value={settings.budgetLimits.daily}
                      onChange={(e) => updateSetting('budgetLimits.daily', Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Globe size={20} />
                Preferences
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex text-sm font-medium mb-2 items-center gap-2">
                    <Clock size={16} />
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    <option value="GMT+0">GMT+0 - London</option>
                    <option value="GMT+1">GMT+1 - Lagos, Berlin</option>
                    <option value="GMT+2">GMT+2 - Cairo</option>
                    <option value="GMT+3">GMT+3 - Moscow</option>
                    <option value="GMT-5">GMT-5 - New York</option>
                    <option value="GMT-8">GMT-8 - Los Angeles</option>
                  </select>
                </div>

                <div>
                  <label className="flex text-sm font-medium mb-2 items-center gap-2">
                    <Globe size={16} />
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    <option value="English">English</option>
                    <option value="French">French</option>
                    <option value="Spanish">Spanish</option>
                    <option value="German">German</option>
                  </select>
                </div>
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                </div>
                <div onClick={() => setDarkMode(!darkMode)} className="cursor-pointer">
                  <DarkModeToggle />
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Bell size={16} />
                  Notifications
                </h3>
                <div className="space-y-3">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600">
                      <div>
                        <h4 className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {key === 'email' && 'Receive notifications via email'}
                          {key === 'push' && 'Receive push notifications in browser'}
                          {key === 'budgetAlerts' && 'Get notified when approaching budget limits'}
                          {key === 'monthlyReports' && 'Receive monthly spending reports'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateSetting(`notifications.${key}`, e.target.checked)}
                        className="w-4 h-4 text-blue-400 border-gray-300 rounded focus:ring-blue-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Shield size={20} />
                Security & Privacy
              </h2>

              {/* Change Password */}
              <div className="border rounded-lg p-4 dark:border-gray-600">
                <h3 className="font-medium mb-3">Change Password</h3>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <button
                    onClick={handlePasswordChange}
                    className="bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <h3 className="font-medium mb-3">Privacy Settings</h3>
                <div className="space-y-3">
                  {Object.entries(settings.privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600">
                      <div>
                        <h4 className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {key === 'profileVisible' && 'Make your profile visible to other users'}
                          {key === 'dataSharing' && 'Allow anonymous data sharing for app improvement'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateSetting(`privacy.${key}`, e.target.checked)}
                        className="w-4 h-4 text-blue-400 border-gray-300 rounded focus:ring-blue-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Delete Account */}
              <div className="border border-red-300 rounded-lg p-4 bg-red-50 dark:bg-red-900/20 dark:border-red-700">
                <h3 className="font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                  <Trash2 size={16} />
                  Danger Zone
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Delete Account
                </button>
                
                {showDeleteConfirm && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="password"
                      placeholder="Enter your password to confirm"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full border border-red-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-red-600"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Download size={20} />
                Data Management
              </h2>

              {/* Export Data */}
              <div className="border rounded-lg p-4 dark:border-gray-600">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Download size={16} />
                  Export Your Data
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  Download all your data including transactions, settings, and preferences.
                </p>
                <button
                  onClick={handleExportData}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                >
                  <Download size={16} />
                  Export Data
                </button>
              </div>

              {/* Account Statistics */}
              <div className="border rounded-lg p-4 dark:border-gray-600">
                <h3 className="font-medium mb-3">Account Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Account created:</span>
                    <p className="font-medium">
                      {user?.metadata?.creationTime ? 
                        new Date(user.metadata.creationTime).toLocaleDateString() : 
                        'Unknown'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Last login:</span>
                    <p className="font-medium">
                      {user?.metadata?.lastSignInTime ? 
                        new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                        'Unknown'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}