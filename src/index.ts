
// while read f; do \
// git blame -w -M -C -C --line-porcelain "$f" | \
// grep -I '^author-mail '; \
// done | cut -f2 -d'<' | cut -f1 -d'>' | sort -f | uniq -ic | sort -n