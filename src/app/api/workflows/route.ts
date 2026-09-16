import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { WorkflowPipeline } from '@/types';
import { WorkflowPipelineSchema } from '@/lib/schemas/workflow-pipeline.schema';

export async function GET() {
  try {
    await initDb();
    const sql = getDb();
    const rows = await sql`
      SELECT id, name, niche_type as "nicheType", workflow, is_pinned as "isPinned", created_at as "createdAt"
      FROM saved_workflows
      ORDER BY is_pinned DESC, created_at DESC
    `;

    const workflows = rows.map((r: any) => ({
      ...r.workflow,
      id: r.id,
      name: r.name,
      nicheType: r.nicheType,
      isPinned: Boolean(r.isPinned),
      createdAt: r.createdAt,
    }));

    return NextResponse.json({ success: true, workflows });
  } catch (error: any) {
    console.error('Failed to fetch workflows from Neon DB:', error);
    return NextResponse.json({ success: false, error: error?.message, workflows: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json();

    const validated = WorkflowPipelineSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.format() },
        { status: 400 }
      );
    }

    const workflow: WorkflowPipeline = validated.data;
    const workflowId = workflow.id || `workflow-${Date.now()}`;
    const sql = getDb();

    await sql`
      INSERT INTO saved_workflows (id, name, niche_type, workflow, is_pinned)
      VALUES (${workflowId}, ${workflow.name}, ${workflow.nicheType}, ${JSON.stringify(workflow)}, ${Boolean(workflow.isPinned)})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        niche_type = EXCLUDED.niche_type,
        workflow = EXCLUDED.workflow,
        is_pinned = EXCLUDED.is_pinned;
    `;

    return NextResponse.json({
      success: true,
      workflow: { ...workflow, id: workflowId },
    });
  } catch (error: any) {
    console.error('Failed to save workflow to Neon DB:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    const sql = getDb();
    await sql`DELETE FROM saved_workflows WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete workflow from Neon DB:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
