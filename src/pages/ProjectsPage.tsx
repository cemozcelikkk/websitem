import { projects } from 'virtual:content';
import { ProjectCards } from '../components/ProjectList';
import { PageHeader } from '../components/ui';
import { SITE } from '../site';

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projeler">
        <p>
          Bu liste bir yetenek tablosu değil, bir günlük. Her işin altına neyi kullandığımı ve neden
          onu seçtiğimi not ettim. Geliştirdiğim projelerin detaylarını{' '}
          <a href={SITE.github} target="_blank" rel="noreferrer noopener" className="link-draw focus-ring pb-0.5 text-ink [background-size:100%_1px]">
            GitHub
          </a>{' '}
          profilimde bulabilirsiniz.
        </p>
      </PageHeader>
      <div className="mt-14">
        <ProjectCards projects={projects} />
      </div>
    </>
  );
}
