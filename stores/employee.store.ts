import { cookieStorage, createJSONStorage, createSelectors, persist } from '@/lib/store';
import { create } from "zustand";
import { UserSchemaType } from "@/lib/zod/user.schema";


type EmployeeStore = {
    employees: UserSchemaType[];
    addEmployee: (user: UserSchemaType) => void;
    addEmployees: (employees: UserSchemaType[]) => void;
    getEmployees: () => UserSchemaType[];
    updateEmployee: (id: number, updatedUser: Partial<UserSchemaType>) => boolean;
    removeEmployee: (index: number) => void;
    resetEmployees: () => void;
    emailExists: (email: string, excludeId?: number) => boolean;
    getEmployeeById: (id: number) => UserSchemaType | undefined;
};

export const useEmployeeStore = createSelectors(create<EmployeeStore>()(
    persist(
        (set, get) => ({
            employees: [],
            addEmployee: (user) => {
                const state = get();
                // Vérifier si l'email existe déjà
                if (state.employees.some(employee => employee.email === user.email)) {
                    console.error(`Email ${user.email} already exists`);
                    return false;
                }

                set((state) => ({ employees: [...state.employees, user] }));
                return true;
            },

            addEmployees(employees) {
                set({ employees })
            },

            getEmployees() {
                return get().employees;
            },

            updateEmployee: (id: number, updatedUser: Partial<UserSchemaType>) => {
                const state = get();
                const employeeIndex = id;

                // Vérifier si l'employé existe
                if (employeeIndex < 0 || employeeIndex >= state.employees.length) {
                    console.error(`Employee with id ${id} not found`);
                    return false;
                }

                // Si l'email est modifié, vérifier l'unicité
                if (updatedUser.email) {
                    const emailExists = state.employees.some(
                        (employee, index) =>
                            employee.email === updatedUser.email && index !== employeeIndex
                    );

                    if (emailExists) {
                        console.error(`Email ${updatedUser.email} already exists`);
                        return false;
                    }
                }

                // Mettre à jour l'employé
                set((state) => ({
                    employees: state.employees.map((employee, index) =>
                        index === employeeIndex
                            ? { ...employee, ...updatedUser }
                            : employee
                    )
                }));

                return true;
            },

            removeEmployee: (index) =>
                set((state) => ({
                    employees: state.employees.filter((_, i) => i !== index),
                })),

            resetEmployees: () => set({ employees: [] }),

            emailExists: (email, excludeId) => {
                const state = get();
                return state.employees.some((employee, index) =>
                    employee.email === email && (excludeId === undefined || index !== excludeId)
                );
            },

            getEmployeeById: (id: number) =>
                get().employees.find((_, index) => index === id)
        }),
        {
            name: "employee-data",
            storage: createJSONStorage(() => cookieStorage),
        }
    )
));