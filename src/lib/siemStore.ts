import { create } from 'zustand';
import {
  Alert, AlertStatus, Incident, LogEntry, SOCMetrics,
  initialAlerts, initialIncidents, initialLogs, initialMetrics,
  generateLogs, generateAlerts, generateSOCMetrics, generateIncidents
} from './mockData';

interface SIEMState {
  logs: LogEntry[];
  alerts: Alert[];
  incidents: Incident[];
  metrics: SOCMetrics;
  selectedAlertId: string | null;
  activeTab: 'dashboard' | 'logs' | 'alerts' | 'incidents' | 'threat-intel';

  // Actions
  setActiveTab: (tab: SIEMState['activeTab']) => void;
  selectAlert: (id: string | null) => void;
  updateAlertStatus: (alertId: string, status: AlertStatus) => void;
  acknowledgeAlert: (alertId: string) => void;
  escalateToIncident: (alertId: string) => void;
  closeAlert: (alertId: string, reason: string) => void;
  simulateBlockIP: (alertId: string) => void;
  simulateDisableUser: (alertId: string) => void;
  addTimelineEvent: (alertId: string, description: string) => void;
  refreshData: () => void;
  /** Push a single alert received via WebSocket into the store */
  addAlert: (alert: Alert) => void;
}

export const useSIEMStore = create<SIEMState>((set, get) => ({
  logs: initialLogs,
  alerts: initialAlerts,
  incidents: initialIncidents,
  metrics: initialMetrics,
  selectedAlertId: null,
  activeTab: 'dashboard',

  setActiveTab: (tab) => set({ activeTab: tab }),

  selectAlert: (id) => set({ selectedAlertId: id }),

  updateAlertStatus: (alertId, status) => set((state) => ({
    alerts: state.alerts.map(a =>
      a.id === alertId ? { ...a, status, updatedAt: new Date() } : a
    ),
  })),

  acknowledgeAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map(a =>
      a.id === alertId ? {
        ...a,
        status: 'acknowledged' as AlertStatus,
        acknowledgedAt: new Date(),
        assignee: 'analyst1',
      } : a
    ),
  })),

  escalateToIncident: (alertId) => set((state) => {
    const alert = state.alerts.find(a => a.id === alertId);
    if (!alert) return state;

    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      title: `Incident: ${alert.title}`,
      description: alert.description,
      severity: alert.severity,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      alertIds: [alertId],
      assignee: 'analyst1',
    };

    return {
      alerts: state.alerts.map(a =>
        a.id === alertId ? { ...a, status: 'incident' as AlertStatus } : a
      ),
      incidents: [newIncident, ...state.incidents],
    };
  }),

  closeAlert: (alertId, reason) => set((state) => ({
    alerts: state.alerts.map(a =>
      a.id === alertId ? {
        ...a,
        status: 'closed' as AlertStatus,
        closedAt: new Date(),
        timeline: [...a.timeline, {
          id: `${Date.now()}`,
          timestamp: new Date(),
          description: `Alert closed: ${reason}`,
          type: 'action' as const,
        }],
      } : a
    ),
  })),

  simulateBlockIP: (alertId) => set((state) => ({
    alerts: state.alerts.map(a =>
      a.id === alertId ? {
        ...a,
        timeline: [...a.timeline, {
          id: `${Date.now()}`,
          timestamp: new Date(),
          description: `Response action: Blocked IP ${a.sourceIp} at firewall`,
          type: 'action' as const,
        }],
      } : a
    ),
  })),

  simulateDisableUser: (alertId) => set((state) => ({
    alerts: state.alerts.map(a =>
      a.id === alertId ? {
        ...a,
        timeline: [...a.timeline, {
          id: `${Date.now()}`,
          timestamp: new Date(),
          description: `Response action: Disabled user account "${a.user}"`,
          type: 'action' as const,
        }],
      } : a
    ),
  })),

  refreshData: () => {
    const newAlerts = generateAlerts(15);
    set({
      logs: generateLogs(60),
      alerts: newAlerts,
      incidents: generateIncidents(newAlerts),
      metrics: generateSOCMetrics(newAlerts),
    });
  },

  addAlert: (alert) => set((state) => {
    // Avoid duplicate alerts (by id)
    if (state.alerts.some((a) => a.id === alert.id)) return state;

    const updatedAlerts = [alert, ...state.alerts];

    // Recompute metrics so KPI cards and charts stay accurate
    const updatedMetrics = generateSOCMetrics(updatedAlerts);

    return {
      alerts: updatedAlerts,
      metrics: updatedMetrics,
    };
  }),
}));
