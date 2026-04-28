import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ProductModifierDTO } from './../../dto/ProductModifierDTO';
import { productService } from '../../backend/';
import { AppError } from '../../utils/error.ts';
import { notify } from './NotificationStore';
import type { ProductModifierProps } from '../../backend/domain/product/modifiers/ProductModifier.ts';

interface ModifiersState {
    isLoading: boolean;
    error: string;
    modifiers: ProductModifierDTO[];
    modifier: ProductModifierDTO;
    usedInProducts: number[];
    getAll: () => ProductModifierDTO[];
    getModifier: (id: number) => ProductModifierDTO;
    createModifier: (values: Omit<ProductModifierProps, 'id'>) => ProductModifierDTO;
    deleteModifier: (id: number) => number;
    updateModifier: (values: ProductModifierProps) => ProductModifierDTO;
    setModifier: (id: number) => void;
}

const name = 'modifier';
export const modifierStore = create<ModifiersState>()(
    devtools(
        (set, get) => ({
            isLoading: false,
            modifiers: [],
            modifier: undefined,
            usedInProducts: undefined,
            getAll: async () => {
                set(
                    { modifiers: [], error: '', isLoading: true, usedInProducts: undefined },
                    false,
                    `${name}/getAll:start`,
                );

                try {
                    const modifiers = await productService.getAllModifiers();

                    set({ isLoading: false, modifiers }, false, `${name}/getAll:success`);

                    return modifiers;
                } catch (error: unknown) {
                    if (error instanceof AppError) set({ error: error.message }, false, `${name}/getAll:errorMessage`);

                    set({ isLoading: false }, false, `${name}/getAll:error`);

                    notify.error(`Помилка отримання модифікаторів: ${get().error}`);
                }
            },
            createModifier: async (values) => {
                set({ isLoading: true, error: '', modifier: undefined }, false, `${name}/create:start`);

                try {
                    const modifier = await productService.saveModifier(values);

                    set({ isLoading: false, modifier });

                    notify.success('Створено новий модифікатор');

                    return modifier;
                } catch (error: unknown) {
                    if (error instanceof AppError) set({ error: error.message }, false, `${name}/create:errorMessage`);

                    set({ isLoading: false }, false, `${name}/create:error`);

                    notify.error(`Помилка створення модифікатора: ${get().error}`);
                }
            },
            setModifier: (id: number) => set({ modifier: get().modifiers.find((i) => i.id === id) }),
            updateModifier: async (values) => {
                set({ isLoading: true, error: '' }, false, `${name}/update:start`);

                try {
                    const modifier = await productService.updateModifier(values);

                    set({ isLoading: false, modifier }, false, `${name}/update:success`);

                    notify.success('Модифікатор оновлено');

                    return modifier;
                } catch (error: unknown) {
                    if (error instanceof AppError) set({ error: error.message }, false, `${name}/update:errorMessage`);

                    set({ isLoading: false }, false, `${name}/update:error`);

                    notify.error(`Помилка оновлення модифікатора: ${get().error}`);
                }
            },

            getModifier: async (id: number) => {
                set(
                    { isLoading: true, error: '', modifier: undefined, usedInProducts: undefined },
                    false,
                    `${name}/getModifier:start`,
                );

                try {
                    const modifier = await productService.getModifierToView(id);

                    set({ isLoading: false, modifier }, false, `${name}/getModifier:success'`);

                    return modifier;
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getModifier:errorMessage`);

                    set({ isLoading: false }, false, `${name}/getModifier:error`);

                    notify.error(`Модифікатора не знайдено: ${get().error}`);
                }
            },
            deleteModifier: async (id: number) => {
                set({ isLoading: true, error: '' }, false, `${name}/delete:start`);

                try {
                    await productService.deleteModifier(id);

                    set({ isLoading: false, modifier: undefined }, false, `${name}/delete:success'`);

                    notify.success('Модифікатор видалено');

                    return id;
                } catch (error: unknown) {
                    if (error instanceof AppError) {
                        set(
                            { error: error.message, usedInProducts: error.details.data },
                            false,
                            `${name}/delete:errorMessage`,
                        );
                    }

                    set({ isLoading: false }, false, `${name}/delete:error`);

                    notify.error(`Помилка видалення модифікатора ${get().error}`);
                }
            },
        }),
        { name, enabled: false },
    ),
);
