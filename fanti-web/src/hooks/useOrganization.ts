import { useCallback, useState } from 'react';
import { OrganizationData, Period, PeriodStaff, TaskItem, TasksPeriod } from '../types';

interface UseOrganizationProps {
  periodStaffs: PeriodStaff[];
  tasksPeriod: TasksPeriod[];
  message: any;
  organizingPeriod?: Period;
  onDataChange?: () => void;
  // Hook methods
  updatePeriodStaff: (id: string, updates: any) => Promise<any>;
  createTaskPeriod: (taskPeriod: any) => Promise<any>;
  deleteTaskPeriod: (id: string) => Promise<any>;
}

export const useOrganization = ({
  periodStaffs,
  tasksPeriod,
  message,
  organizingPeriod,
  onDataChange,
  updatePeriodStaff,
  createTaskPeriod,
  deleteTaskPeriod
}: UseOrganizationProps) => {
  const [orgData, setOrgData] = useState<OrganizationData>({});
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, { number: string; hours: number; projectId?: string }>>({});

  const initializeOrgData = useCallback((period: Period) => {
    const initialOrgData: OrganizationData = {};
    period.staffs?.forEach(staff => {
      const ps = periodStaffs.find(p => p.staffId === staff.id && p.periodId === period.id);
      if (ps) {
        const existingTasks = tasksPeriod.filter(tp => tp.periodStaffId === ps.id).map(tp => ({ id: tp.id, number: tp.taskNumber, hours: tp.taskHours, projectId: tp.projectId }));
        const totalTaskHours = existingTasks.reduce((sum, t) => sum + t.hours, 0);
        initialOrgData[staff.id] = { totalHours: ps.totalHours, tasks: existingTasks, remaining: ps.totalHours - totalTaskHours };
      }
    });
    setOrgData(initialOrgData);
    setNewTaskInputs({});
  }, [periodStaffs, tasksPeriod]);

  const updateTotalHours = useCallback(async (staffId: string, value: number, currentOrganizingPeriod: Period) => {
    setOrgData(prev => {
      const data = prev[staffId];
      if (!data) return prev;
      return {
        ...prev,
        [staffId]: {
          ...data,
          totalHours: value,
          remaining: value - data.tasks.reduce((sum, t) => sum + t.hours, 0)
        }
      };
    });

    // Save to backend
    if (currentOrganizingPeriod) {
      const ps = periodStaffs.find(p => p.staffId === staffId && p.periodId === currentOrganizingPeriod.id);
      if (ps) {
        try {
          await updatePeriodStaff(ps.id, {
            TotalHours: value
          });
          onDataChange?.(); // Notify parent component to refresh data
        } catch (error) {
          message.error('Error updating total hours:', error);
        }
      }
    }
  }, [periodStaffs, updatePeriodStaff, onDataChange, message]);

  const addTask = useCallback(async (staffId: string, currentOrganizingPeriod: Period) => {
    const taskInput = newTaskInputs[staffId];
    if (!taskInput?.number || !taskInput.hours || !taskInput.projectId || orgData[staffId].remaining < taskInput.hours) return;

    const num = parseInt(taskInput.number);
    if (isNaN(num)) return;

    // Create TasksPeriod first to get the ID
    const ps = periodStaffs.find(p => p.staffId === staffId && p.periodId === currentOrganizingPeriod.id);
    if (ps) {
      try {
        const createdTask = await createTaskPeriod({
          PeriodStaffId: ps.id,
          TaskNumber: num,
          TaskHours: taskInput.hours,
          ProjectId: taskInput.projectId
        });

        // Add task to local state with the real ID from backend
        const newTask: TaskItem = {
          id: createdTask.data.id,
          number: num,
          hours: taskInput.hours,
          projectId: taskInput.projectId
        };

        setOrgData(prev => {
          const data = prev[staffId];
          if (!data) return prev;
          return {
            ...prev,
            [staffId]: {
              ...data,
              tasks: [...data.tasks, newTask],
              remaining: data.remaining - taskInput.hours
            }
          };
        });

        setNewTaskInputs(prev => ({ ...prev, [staffId]: { number: '', hours: 0, projectId: undefined } }));
      } catch (error) {
        message.error('Error creating task:', error);
      }
    }
  }, [newTaskInputs, orgData, periodStaffs, createTaskPeriod, message]);

  const removeTask = useCallback(async (staffId: string, index: number) => {
    const task = orgData[staffId]?.tasks[index];
    if (!task) return;

    const removedHours = task.hours;

    setOrgData(prev => {
      const data = prev[staffId];
      if (!data) return prev;
      const newTasks = [...data.tasks];
      newTasks.splice(index, 1);
      return {
        ...prev,
        [staffId]: {
          ...data,
          tasks: newTasks,
          remaining: data.remaining + removedHours
        }
      };
    });

    // Delete TasksPeriod
    if (task.id) {
      try {
        await deleteTaskPeriod(task.id);
        onDataChange?.(); // Notify parent component to refresh data
      } catch (error) {
        message.error('Error deleting task:', error);
      }
    }
  }, [orgData, deleteTaskPeriod, onDataChange, message]);



  return {
    orgData,
    newTaskInputs,
    setNewTaskInputs,
    initializeOrgData,
    updateTotalHours,
    addTask,
    removeTask,
  };
};
