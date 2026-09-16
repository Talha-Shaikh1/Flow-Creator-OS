'use client';

import React, { useState, useEffect } from 'react';
import { CastMember, CharacterRole } from '@/types';
import {
  Users,
  UserPlus,
  Pin,
  Trash2,
  Copy,
  Check,
  Sparkles,
  X,
  BookmarkCheck,
  ShieldCheck,
  Coffee,
  Smartphone,
  Briefcase,
  Eye,
  Camera,
  Layers,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCharactersUpdated?: (characters: CastMember[]) => void;
}

interface ArchetypePreset {
  name: string;
  role: CharacterRole;
  category: 'Drama' | 'Object' | 'Creator';
  dnaPrompt: string;
  description: string;
}

const ARCHETYPE_PRESETS: ArchetypePreset[] = [
  {
    name: 'Elena (UK/EU Persona 1)',
    role: 'Hero',
    category: 'Creator',
    description: 'UK/Europe AI Influencer — Brunette, green eyes, signature cheek mole, Shure mic.',
    dnaPrompt: '24yo woman with brunette hair, green eyes, natural subtle makeup, distinct signature cheek beauty mole on cheekbone. Styling: gold layered necklace, small stud earrings, off-shoulder dark knit top. Warm, relatable, authentic real skin texture with visible pores. Lock 100% to uploaded master reference image.',
  },
  {
    name: 'Joe the Cat (Persona 2 Star)',
    role: 'Hero',
    category: 'Creator',
    description: 'Grey British Shorthair cat with brown leather collar "JOE", deadpan witty sarcasm.',
    dnaPrompt: 'Hyper-realistic photo of a grey British Shorthair cat named Joe, sitting upright on a wooden coffee table in a cozy traditional living room, warm fireplace glowing softly out of focus behind him. Wearing a simple brown leather collar with a small round tag engraved "JOE". Dense plush grey fur, round face, striking copper-orange eyes with sharp catchlight, calm and slightly judgmental expression, ears alert. Warm golden natural lighting, shallow depth of field, blurred cozy background, cinematic photography, shot on 85mm lens, ultra realistic, 4k, professional pet photography style, 9:16 vertical composition',
  },
  {
    name: 'Nova the Corgi (Persona 2)',
    role: 'Side',
    category: 'Creator',
    description: 'Cream-colored corgi with red bowtie, hyper, loyal, earnest chaotic comedy.',
    dnaPrompt: 'Hyper-realistic photo of a cream-colored corgi named Nova, sitting on wood parquet flooring in a cozy traditional living room, warm fireplace visible softly blurred in the background. Wearing a small red bowtie around his neck. Thick fluffy fur, short legs, big round brown eyes, tongue slightly out, alert happy expression, ears perked straight up. Warm golden natural lighting, shallow depth of field, blurred cozy background, cinematic photography, shot on 85mm lens, ultra realistic, 4k, professional pet photography style, 9:16 vertical composition',
  },
  {
    name: 'Zara (Persona 2 Owner)',
    role: 'Side',
    category: 'Creator',
    description: 'Young woman mid-20s, wavy brown hair, navy tank top, layered silver necklaces.',
    dnaPrompt: 'Hyper-realistic cinematic portrait of a young woman in her mid-20s named Zara, wavy brown shoulder-length hair, natural soft makeup, wearing a casual navy tank top and layered silver necklaces. Sitting on a cream sectional sofa in a cozy traditional living room, a lit fireplace and wooden bookshelf softly blurred in the background. Warm golden natural sunlight from a window, shallow depth of field, candid expressive facial expression, cinematic photography, shot on 50mm lens, ultra realistic, 4k, natural skin texture, professional portrait photography style, 9:16 vertical composition',
  },
  {
    name: 'Julian Vance',
    role: 'Hero',
    category: 'Drama',
    description: 'Disgraced tech founder fighting for his family heritage.',
    dnaPrompt: '32yo sharp-featured man with intense slate-blue eyes, disheveled dark brown hair, tailored charcoal wool overcoat over open-collar black shirt, subtle dark stubble. Style: Hyper-Realistic Cinematic. Consistent facial structure, coat texture, lighting tone.',
  },
  {
    name: 'Elena Rostova',
    role: 'Villain',
    category: 'Drama',
    description: 'Cold, calculating corporate director with an iron grip.',
    dnaPrompt: '29yo poised woman with razor-sharp cheekbones, platinum blonde hair in sleek low chignon, minimalist ivory double-breasted power suit, emerald stud earrings. Style: Hyper-Realistic Cinematic. Consistent jawline, hair, and wardrobe palette.',
  },
  {
    name: 'Detective Miller',
    role: 'Side',
    category: 'Drama',
    description: 'Weary 90s detective who has seen too much.',
    dnaPrompt: '45yo rugged detective with weathered jaw, heavy salt-and-pepper stubble, distressed brown leather trench coat, dark charcoal turtleneck, observant analytical stare. Cinematic moody 35mm film.',
  },
  {
    name: 'Espresso Mug',
    role: 'Hero',
    category: 'Object',
    description: 'Weathered ceramic espresso cup with animated facial features.',
    dnaPrompt: 'Weathered ceramic espresso cup with glossy artisan glaze, gentle steam rising, realistic expressive micro-expressions on porcelain surface, soft warm café lighting.',
  },
  {
    name: 'Sarcastic Smartphone',
    role: 'Villain',
    category: 'Object',
    description: 'Modern flagship smartphone with glowing sarcastic OLED face.',
    dnaPrompt: 'Sleek matte-black modern smartphone with expressive glowing animated OLED eyes and mouth on dark glass display, reflective bevels, high-tech neon studio lighting.',
  },
  {
    name: 'Aria Chen',
    role: 'Hero',
    category: 'Creator',
    description: 'Aesthetic Gen-Z lifestyle & tech creator.',
    dnaPrompt: '23yo Asian-American aesthetic content creator, effortless messy bun, oversized sage green streetwear hoodie, warm ring-light eye reflection, studio microphone in foreground.',
  },
];

export function CharacterVaultModal({ isOpen, onClose, onCharactersUpdated }: Props) {
  const [characters, setCharacters] = useState<CastMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedDnaId, setCopiedDnaId] = useState<string | null>(null);

  // Form State for creating new character
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<CharacterRole>('Hero');
  const [description, setDescription] = useState('');
  const [dnaPrompt, setDnaPrompt] = useState('');
  const [usesRefImage, setUsesRefImage] = useState(false);
  const [isPinned, setIsPinned] = useState(true);

  // Load characters from DB
  const fetchCharacters = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/characters');
      const data = await res.json();
      if (data.characters) {
        setCharacters(data.characters);
        onCharactersUpdated?.(data.characters);
      }
    } catch (err) {
      console.warn('Failed to load characters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCharacters();
    }
  }, [isOpen]);

  const handleApplyPreset = (preset: ArchetypePreset) => {
    setName(preset.name);
    setRole(preset.role);
    setDescription(preset.description);
    setDnaPrompt(preset.dnaPrompt);
    setUsesRefImage(false);
  };

  const handleSaveCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!dnaPrompt.trim() && !usesRefImage)) return;

    const finalDna = usesRefImage
      ? `[FACE & IDENTITY]: Use attached Reference Image in Google Flow. Personality: ${description || 'Dynamic'}. Wardrobe: Consistent character style.`
      : dnaPrompt.trim();

    const newChar: CastMember = {
      id: `char-${Date.now()}`,
      name: name.trim(),
      role,
      description: description.trim() || `${name.trim()} (${role})`,
      dnaPrompt: finalDna,
      usesReferenceImage: usesRefImage,
    };

    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newChar, isPinned }),
      });
      if (res.ok) {
        const updated = [newChar, ...characters];
        setCharacters(updated);
        onCharactersUpdated?.(updated);
        setIsAddingNew(false);
        // Reset form
        setName('');
        setDescription('');
        setDnaPrompt('');
        setUsesRefImage(false);
      }
    } catch (err) {
      console.error('Error saving character:', err);
    }
  };

  const handleDeleteCharacter = async (id: string) => {
    if (!confirm('Are you sure you want to remove this character from your Vault?')) return;
    try {
      await fetch(`/api/characters?id=${id}`, { method: 'DELETE' });
      const updated = characters.filter((c) => c.id !== id);
      setCharacters(updated);
      onCharactersUpdated?.(updated);
    } catch (err) {
      console.error('Error deleting character:', err);
    }
  };

  const handleCopyDna = (dna: string, id: string) => {
    navigator.clipboard.writeText(dna);
    setCopiedDnaId(id);
    setTimeout(() => setCopiedDnaId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Character DNA Vault</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Synced with Neon DB
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Lock facial geometry, wardrobe, and biometric DNA so Google Flow never drifts between clips.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isAddingNew && (
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ New Character DNA</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Add / Edit Character Form */}
          {isAddingNew && (
            <div className="p-5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Define Character DNA Lock
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {/* 1-Click Archetype Quick Presets */}
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-neutral-400">
                  Quick Load Viral Archetype Presets (1-Click):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ARCHETYPE_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] font-medium border border-neutral-700/60 transition flex items-center gap-1"
                    >
                      {p.category === 'Object' ? (
                        <Coffee className="w-3 h-3 text-amber-400" />
                      ) : p.category === 'Creator' ? (
                        <Smartphone className="w-3 h-3 text-pink-400" />
                      ) : (
                        <Briefcase className="w-3 h-3 text-indigo-400" />
                      )}
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveCharacter} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-300">Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Julian Vance"
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-neutral-300">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as CharacterRole)}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Hero">Hero (Protagonist)</option>
                      <option value="Villain">Villain (Antagonist)</option>
                      <option value="Side">Side / Supporting</option>
                      <option value="Narrator">Narrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-neutral-300">Short Summary</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Disgraced tech founder"
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Identity Anchor Type */}
                <div className="flex items-center gap-4 text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                    <input
                      type="checkbox"
                      checked={usesRefImage}
                      onChange={(e) => setUsesRefImage(e.target.checked)}
                      className="rounded border-neutral-700 text-indigo-600 focus:ring-0"
                    />
                    <span className="flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-indigo-400" />
                      Will upload Reference Image directly to Flow
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="rounded border-neutral-700 text-indigo-600 focus:ring-0"
                    />
                    <span className="flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5 text-amber-400" />
                      Pin as Default Series Character
                    </span>
                  </label>
                </div>

                {!usesRefImage && (
                  <div>
                    <label className="text-[11px] font-medium text-neutral-300">
                      Biometric DNA Prompt (Facial Structure, Eyes, Hair, Wardrobe, Style)
                    </label>
                    <textarea
                      required={!usesRefImage}
                      value={dnaPrompt}
                      onChange={(e) => setDnaPrompt(e.target.value)}
                      rows={3}
                      placeholder="e.g. 32yo sharp-featured man with intense slate-blue eyes, disheveled dark brown hair, tailored charcoal wool coat..."
                      className="w-full mt-1 p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                  >
                    Save DNA to Vault
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Stored Characters Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-indigo-400" />
                Persistent Cast Library ({characters.length})
              </h3>
              <span className="text-[11px] text-neutral-400">
                These characters automatically populate your Spec Wizard
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-neutral-400 text-xs">
                Loading characters from Neon DB...
              </div>
            ) : characters.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl space-y-3">
                <Users className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  No characters saved in your vault yet. Click &ldquo;New Character DNA&rdquo; above or pick a quick preset to lock in your cast.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-indigo-300 text-xs font-medium"
                >
                  + Create Your First Character
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {characters.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-3 hover:border-neutral-700 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs text-neutral-200">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-neutral-100">{c.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                              {c.role}
                            </span>
                            {c.isPinned && (
                              <Pin className="w-3 h-3 text-amber-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 line-clamp-1">{c.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopyDna(c.dnaPrompt, c.id)}
                          title="Copy DNA prompt to clipboard"
                          className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                        >
                          {copiedDnaId === c.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCharacter(c.id)}
                          title="Delete character"
                          className="p-1.5 rounded-md hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-300 font-mono line-clamp-3">
                      {c.dnaPrompt}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Master Spatial Keyframe Lock Active
                      </span>
                      {c.usesReferenceImage && (
                        <span className="text-indigo-400 flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          Ref Image Mode
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-xs text-neutral-400">
          <span>Characters in this vault persist across all 7 days of generated content.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
}
