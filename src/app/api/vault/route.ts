import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('content_vault')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, count, error } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ data, total: count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    const body = await req.json();
    const { type, category, content, title } = body;

    if (!type || !category || !content) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('content_vault')
      .insert([{ type, category, content, title }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    const body = await req.json();
    const { id, type, category, content, title, is_favorite } = body;

    if (!id) {
      return NextResponse.json({ error: 'El ID es requerido' }, { status: 400 });
    }

    const updates: any = {};
    if (type !== undefined) updates.type = type;
    if (category !== undefined) updates.category = category;
    if (content !== undefined) updates.content = content;
    if (title !== undefined) updates.title = title;
    if (is_favorite !== undefined) updates.is_favorite = is_favorite;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('content_vault')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'El ID es requerido' }, { status: 400 });
    }

    const { error } = await supabase
      .from('content_vault')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
