import re

def update_y(match):
    # Match the y value in position: { x: ..., y: ..., depth: ... }
    # We'll capture the whole line and replace the y number
    line = match.group(0)
    # Find the y value
    # Pattern: y: \d+
    def replace_y(m):
        return f'y: {int(m.group(1)) + 40}'
    line = re.sub(r'y: (\d+)', replace_y, line)
    return line

def update_tour_view_y(match):
    # Match the y in view: { x: ..., y: ..., zoom: ... }
    line = match.group(0)
    def replace_y(m):
        return f'y: {int(m.group(1)) + 40}'
    line = re.sub(r'y: (\d+)', replace_y, line)
    return line

with open('src/data/towerData.ts', 'r') as f:
    content = f.read()

# Update position.y
# We'll look for "position: {" and then update until the closing brace
# But simpler: replace all occurrences of y: \d+ that are inside position: {...}
# We'll do a more targeted replacement by iterating over lines.
lines = content.split('\n')
updated_lines = []
in_position = False
in_tour_point = False
for line in lines:
    # Detect if we are inside a position block
    if 'position: {' in line:
        in_position = True
    if in_position and 'y:' in line:
        line = re.sub(r'y: (\d+)', lambda m: f'y: {int(m.group(1)) + 40}', line)
    if in_position and '}' in line and '{' not in line:
        # Assuming the position block ends with a line that has only '}' or ','
        in_position = False
    # Detect tour point view
    if 'view: {' in line:
        in_tour_point = True
    if in_tour_point and 'y:' in line:
        line = re.sub(r'y: (\d+)', lambda m: f'y: {int(m.group(1)) + 40}', line)
    if in_tour_point and '}' in line and '{' not in line:
        in_tour_point = False
    updated_lines.append(line)

new_content = '\n'.join(updated_lines)

with open('src/data/towerData.ts', 'w') as f:
    f.write(new_content)

print('Updated towerData.ts')
