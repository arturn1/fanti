import { Card, Col, Row, Spin, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import AddVersionButton from '../app/(overview)/AddVersionButton';
import VersionModal from '../app/(overview)/VersionModal';

const { Title, Text } = Typography;

export interface ProjectVersionDto {
  id: string;
  version: string;
  deployDate: string;
}

export interface ProjectWithVersionsDto {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  url?: string;
  versions: ProjectVersionDto[];
}

export default function ProjectsDashboard() {
  const [projects, setProjects] = useState<ProjectWithVersionsDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProjectId, setModalProjectId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/projects?versions=true')
      .then(res => res.json())
      .then(data => setProjects(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  // Status legível
  const statusMap: Record<string, { color: string; label: string }> = {
    '1': { color: 'processing', label: 'Ativo' },
    '2': { color: 'default', label: 'Inativo' },
    '3': { color: 'success', label: 'Concluído' },
    '4': { color: 'warning', label: 'Planejamento' },
    '5': { color: 'default', label: 'Arquivado' },
  };

  return (
    <div>
      {loading ? <Spin /> : (
        <Row gutter={[16, 16]}>
          {projects.map(project => {
            // Pega a versão mais recente (maior data de deploy)
            const latestVersion = project.versions && project.versions.length > 0
              ? [...project.versions].sort((a, b) => new Date(b.deployDate).getTime() - new Date(a.deployDate).getTime())[0]
              : null;
            const statusInfo = statusMap[project.status?.toString()] || { color: 'default', label: project.status };
            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
                <div style={{ position: 'relative' }}>
                  <AddVersionButton onClick={() => {
                    setModalProjectId(project.id);
                    setModalOpen(true);
                  }} />
                  <Card
                    title={project.name}
                    bordered
                    hoverable
                    style={{
                      cursor: project.url ? 'pointer' : 'default',
                      transition: 'box-shadow 0.2s',
                    }}
                    onClick={() => {
                      if (project.url) window.open(project.url, '_blank');
                    }}
                    bodyStyle={{
                      background: project.url ? '#f6faff' : undefined,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (project.url) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 8px #1890ff44';
                    }}
                    onMouseLeave={e => {
                      if (project.url) (e.currentTarget as HTMLElement).style.boxShadow = '';
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                      </div>
                      {project.description && (
                        <Text type="secondary" style={{ marginBottom: 8 }}>{project.description}</Text>
                      )}
                      <div style={{ marginTop: 8 }}>
                        <Text strong>Versão Atual: </Text>
                        {latestVersion ? (
                          <Text code>{latestVersion.version}</Text>
                        ) : (
                          <Text type="secondary">Nenhuma versão cadastrada</Text>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </Col>
            );
          })}
        </Row>
      )}
      {/* Modal de versões */}
      <VersionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={modalProjectId || ''}
        versions={
          modalProjectId
            ? (projects.find(p => p.id === modalProjectId)?.versions || [])
            : []
        }
        onCreate={async (version, date) => {
          if (!modalProjectId) return;
          await fetch('/api/projectVersion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: modalProjectId, version, deployDate: date })
          });
          // Atualiza lista
          setLoading(true);
          const res = await fetch('/api/projects?versions=true');
          const data = await res.json();
          setProjects(data.data || []);
          setLoading(false);
        }}
        onEdit={async (id, version) => {
          await fetch('/api/projectVersion', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, version })
          });
          setLoading(true);
          const res = await fetch('/api/projects?versions=true');
          const data = await res.json();
          setProjects(data.data || []);
          setLoading(false);
        }}
        onDelete={async (id) => {
          await fetch(`/api/projectVersion?id=${id}`, { method: 'DELETE' });
          setLoading(true);
          const res = await fetch('/api/projects?versions=true');
          const data = await res.json();
          setProjects(data.data || []);
          setLoading(false);
        }}
      />
    </div>
  );
}
