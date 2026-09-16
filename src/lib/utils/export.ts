import { WeeklyBatchDelivery } from '@/types';

export function exportBatchToMarkdown(batch: WeeklyBatchDelivery): void {
  let md = `# FlowCreator OS — Complete Weekly Production Package\n\n`;
  md += `**Batch ID:** ${batch.id}\n`;
  md += `**Format:** ${batch.spec.format.toUpperCase()}\n`;
  md += `**Visual Style:** ${batch.spec.visualStyle}\n`;
  md += `**Tone:** ${batch.spec.tone}\n`;
  md += `**Genres:** ${batch.spec.genres.join(', ')}\n`;
  md += `**Created:** ${batch.createdAt}\n\n`;

  if (batch.seriesBible) {
    md += `## 📖 7-Day Series Continuity Bible\n\n`;
    md += `**Arc Overview:** ${batch.seriesBible.arcOverview}\n\n`;
    md += `### 🎭 Weekly Character Arcs\n`;
    batch.seriesBible.characterArcs.forEach((c) => {
      md += `- **${c.name}:** ${c.weekArc}\n`;
    });
    md += `\n### ⚡ Key Cliffhangers & Plot Threads\n`;
    batch.seriesBible.keyCliffhangers.forEach((k) => {
      md += `- ${k}\n`;
    });
    md += `\n---\n\n`;
  }

  md += `## 🧬 Master Character DNA Anchors\n\n`;
  batch.spec.cast.forEach((c) => {
    md += `### ${c.name} (${c.role})\n`;
    md += `- **DNA Prompt:** \`${c.dnaPrompt}\`\n`;
    md += `- **Description:** ${c.description}\n\n`;
  });

  md += `## 📍 Master Location Coordinates & Setups\n\n`;
  batch.spec.locationSettings.forEach((loc, i) => {
    md += `${i + 1}. **${loc}**\n`;
  });
  md += `\n---\n\n`;

  batch.days.forEach((d) => {
    md += `# 📅 DAY ${d.dayNumber}: ${d.dayName.toUpperCase()}\n`;
    md += `**Daily Emotional Arc:** ${d.dailyEmotion}\n\n`;

    d.variations.forEach((v) => {
      md += `## 🎬 ${v.variationLabel}: "${v.title}"\n`;
      md += `*${v.hookDescription}*\n\n`;

      md += `### 🗣️ Dialogue Script\n`;
      v.dialogueScript.forEach((dlg) => {
        md += `- **[${dlg.speaker}]** (${dlg.timing}): *"${dlg.line}"*\n`;
      });
      md += `\n`;

      if (batch.spec.format === 'podcast_style') {
        const masterFrame = v.masterFrameImagePrompt || v.clips[0]?.frameImagePrompt;
        md += `### 🎯 Day ${d.dayNumber} Master Starting Frame Image Prompt (Golden Consistency Rule)\n`;
        md += `> **IMPORTANT:** Generate this image ONCE in Midjourney or Google Flow. Feed this exact same image as the starting frame for all ${v.clips.length} clips below to ensure 100% facial and studio consistency.\n\n`;
        md += `\`\`\`text\n${masterFrame}\n\`\`\`\n\n`;

        md += `### 🎞️ Sequenced 10s Google Flow Motion Directives\n\n`;
        v.clips.forEach((c) => {
          md += `#### Clip ${c.clipIndex}/${c.totalClips}: ${c.sceneName}\n`;
          md += `**Dialogue (${c.pacingWordCount} words):** *"${c.speakerIsolation.speakingDialogue}"*\n\n`;
          md += `##### 10s Video Motion Directive (Upload Master Frame + Paste in Google Flow):\n`;
          md += `\`\`\`text\n${c.flowPromptText}\n\`\`\`\n\n`;
          if (c.negativePromptDirectives) {
            md += `**Negative Directives:** \`${c.negativePromptDirectives}\`\n\n`;
          }
        });
      } else {
        md += `### 🎞️ Sequenced Google Flow Production Directives\n\n`;
        v.clips.forEach((c) => {
          md += `#### Clip ${c.clipIndex}/${c.totalClips}: ${c.sceneName} (${c.shotType})\n`;
          md += `**Active Speaker:** ${c.speakerIsolation.activeSpeaker} | **Pacing:** ${c.pacingWordCount} words\n\n`;
          
          md += `##### Step 1: Starting Frame Keyframe Image Prompt (Midjourney / Flow)\n`;
          md += `\`\`\`text\n${c.frameImagePrompt}\n\`\`\`\n\n`;

          md += `##### Step 2: 10s Video Motion Directive (Google Flow Veo)\n`;
          md += `\`\`\`text\n${c.flowPromptText}\n\`\`\`\n\n`;

          if (c.foleySoundDesign) {
            md += `**Sound Design / Foley:** ${c.foleySoundDesign}\n\n`;
          }
          if (c.negativePromptDirectives) {
            md += `**Negative Directives:** \`${c.negativePromptDirectives}\`\n\n`;
          }
        });
      }

      md += `**Social Caption:** ${v.metadata.caption}\n`;
      md += `**Hashtags:** ${v.metadata.hashtags.join(' ')}\n\n`;
      md += `---\n\n`;
    });

    if (d.dailyPhotoPosts && d.dailyPhotoPosts.length > 0) {
      md += `## 📸 Day ${d.dayNumber} Daily Lifestyle Photo Posts (Anti-AI Realism)\n\n`;
      d.dailyPhotoPosts.forEach((photo, pIdx) => {
        md += `### Photo ${pIdx + 1}: ${photo.title} (${photo.category})\n`;
        md += `**Outfit:** ${photo.outfit}\n\n`;
        md += `**Caption:** *"${photo.caption}"*\n`;
        md += `**Hashtags:** ${photo.hashtags.join(' ')}\n\n`;
        md += `**Photorealistic Image Prompt (Midjourney / Flux / Flow):**\n`;
        md += `\`\`\`text\n${photo.imagePrompt}\n\`\`\`\n\n`;
      });
      md += `---\n\n`;
    }
  });


  // Trigger browser download
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `FlowCreator-OS-Week-${batch.id.slice(-6)}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportBatchToJson(batch: WeeklyBatchDelivery): void {
  const jsonStr = JSON.stringify(batch, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `FlowCreator-OS-Week-${batch.id.slice(-6)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

