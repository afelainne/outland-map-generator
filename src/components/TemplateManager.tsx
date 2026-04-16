import { useRef, useState } from 'react';
import { Save, Upload, FolderOpen, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  loadTemplates,
  addTemplate,
  deleteTemplate,
  exportTemplateToFile,
  importTemplateFromFile,
  type SavedTemplate,
} from '@/lib/templateIO';

interface TemplateManagerProps {
  getCurrentTemplate: (name: string) => SavedTemplate;
  onLoadTemplate: (t: SavedTemplate) => void;
}

const TemplateManager = ({ getCurrentTemplate, onLoadTemplate }: TemplateManagerProps) => {
  const [templates, setTemplates] = useState<SavedTemplate[]>(() => loadTemplates());
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [name, setName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const refresh = () => setTemplates(loadTemplates());

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    const tpl = getCurrentTemplate(trimmed);
    addTemplate(tpl);
    refresh();
    setName('');
    setSaveOpen(false);
    toast({ title: 'Template saved', description: trimmed });
  };

  const handleDelete = (n: string) => {
    deleteTemplate(n);
    refresh();
    toast({ title: 'Template deleted', description: n });
  };

  const handleExport = (t: SavedTemplate) => {
    exportTemplateToFile(t);
  };

  const handleExportCurrent = () => {
    const trimmed = name.trim() || `outland-${Date.now()}`;
    const tpl = getCurrentTemplate(trimmed);
    exportTemplateToFile(tpl);
    toast({ title: 'Template exported', description: `${trimmed}.outland.json` });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const tpl = await importTemplateFromFile(file);
      onLoadTemplate(tpl);
      // Also save to local list
      addTemplate(tpl);
      refresh();
      toast({ title: 'Template imported', description: tpl.name });
      setLoadOpen(false);
    } catch (err) {
      toast({ title: 'Import failed', description: 'Invalid template file', variant: 'destructive' });
    }
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Save */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono gap-1.5">
            <Save size={12} /> Save
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Template name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Map"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <p className="text-[11px] text-muted-foreground">
              Saves all current settings (seed, theme, terrain, contours, labels, canvas size).
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={handleExportCurrent}>
              <Download size={12} className="mr-1" /> Export as file
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save size={12} className="mr-1" /> Save locally
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load + Import */}
      <Dialog open={loadOpen} onOpenChange={setLoadOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono gap-1.5">
            <FolderOpen size={12} /> Load
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>My Templates</DialogTitle>
          </DialogHeader>

          <div className="space-y-1 max-h-80 overflow-y-auto">
            {templates.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No saved templates yet. Save one or import a .json file.
              </p>
            )}
            {templates.map((t) => (
              <div
                key={t.name + t.createdAt}
                className="flex items-center justify-between p-2 border border-border rounded hover:bg-muted/50"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{t.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(t.createdAt).toLocaleString()} · {t.themeId} / {t.terrainId}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={() => {
                      onLoadTemplate(t);
                      setLoadOpen(false);
                      toast({ title: 'Template loaded', description: t.name });
                    }}
                  >
                    Load
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleExport(t)}
                    title="Export as file"
                  >
                    <Download size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleDelete(t.name)}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImport}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload size={12} className="mr-1" /> Import .json
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateManager;
