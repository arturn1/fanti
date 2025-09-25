import { useState, useCallback } from 'react';
import { ModalStates, ModalData, Period } from '../types';

export const useModals = () => {
    const [modals, setModals] = useState<ModalStates>({
        createEdit: false,
        view: false,
        organization: false
    });

    const [modalData, setModalData] = useState<ModalData>({
        editingPeriod: null,
        viewingPeriod: null,
        organizingPeriod: null
    });

    const openCreateModal = useCallback(() => {
        setModalData(prev => ({ ...prev, editingPeriod: null }));
        setModals(prev => ({ ...prev, createEdit: true }));
    }, []);

    const openEditModal = useCallback((period: Period) => {
        setModalData(prev => ({ ...prev, editingPeriod: period }));
        setModals(prev => ({ ...prev, createEdit: true }));
    }, []);

    const openViewModal = useCallback((period: Period) => {
        setModalData(prev => ({ ...prev, viewingPeriod: period }));
        setModals(prev => ({ ...prev, view: true }));
    }, []);

    const openOrganizationModal = useCallback((period: Period) => {
        setModalData(prev => ({ ...prev, organizingPeriod: period }));
        setModals(prev => ({ ...prev, organization: true }));
    }, []);

    const closeModal = useCallback((modalType: keyof ModalStates) => {
        setModals(prev => ({ ...prev, [modalType]: false }));
    }, []);

    const closeAllModals = useCallback(() => {
        setModals({
            createEdit: false,
            view: false,
            organization: false
        });
    }, []);

    return {
        modals,
        modalData,
        openCreateModal,
        openEditModal,
        openViewModal,
        openOrganizationModal,
        closeModal,
        closeAllModals
    };
};