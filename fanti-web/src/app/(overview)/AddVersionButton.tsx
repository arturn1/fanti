import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';

export default function AddVersionButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      shape="circle"
      icon={<ExclamationCircleOutlined />}
      size="small"
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 2,
        background: '#1890ff',
        color: '#fff',
        boxShadow: '0 2px 8px #0001',
        border: 'none',
        transition: 'background 0.2s',
      }}
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
      title="Adicionar nova versão"
    />
  );
}
