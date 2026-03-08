# Nested comment handling
# Vote logic
# Post ranking
# Moderation logic (if needed)

from app.db.models.forum import Comment

def build_comment_tree(comments):
    # Only height=2 nesting
    comment_map = {c.id: c for c in comments}
    tree = []
    for c in comments:
        if c.parent_id:
            parent = comment_map.get(c.parent_id)
            if parent:
                parent.replies.append(c)
        else:
            tree.append(c)
    return tree

def increment_vote(entity, up=True):
    entity.votes += 1 if up else -1
    return entity

def sort_posts(posts):
    return sorted(posts, key=lambda p: (p.votes, p.created_at), reverse=True)
