from PIL import Image

import google.generativeai as genai
import json
import os

genai.configure(api_key = os.getenv('API_KEY'))

model = genai.GenerativeModel('gemini-1.5-pro-latest')
image = Image.open('rustic_livingroom_1.jpg')

prompt = '''
Please analyze the interior design and give it a score out of 100. Describe the current style.
Suggest three improvement suggestions and eco-Ffiendly home decor ideas. Output your result in JSON 
format. The JSON object should have the following fields: score, Current Style, Improvement Suggestions, and 
Eco-Friendly Home Decor Ideas. The score field should be an integer. All other fields should be strings.
Do not include any extra text.

Here are some examples:
Example 1:
{
    "score": 90,
    "Current Style": "The living room has a minimalist and modern design characterized by clean lines, neutral colors, 
    and a lack of clutter. The use of light colors and simple furniture enhances the sense of space and tranquility.",
    "Improvement Suggestions": "Cushions: Replace some of the current cushions with ones in deep teal and mustard yellow.
    Arrange them to create a balanced look, mixing the new colors with the existing neutral cushions. Rug: Place a 
    medium-sized rug under the coffee table and sofa area. Choose a rug with a modern geometric pattern that includes 
    the accent colors from the cushions.",
    "Eco-Friendly Home Decor Ideas": "1. Recycled Fabric Cushions
    Materials Needed: Old fabric scraps, needle and thread or a sewing machine, cushion stuffing (recycled foam or old pillows).
    Steps:
        Cut Fabric: Cut fabric scraps into squares or rectangles.
        Sew Sides: Sew the pieces together, leaving one side open.
        Stuff the Cushion: Fill the cushion with recycled stuffing.
        Close the Cushion: Sew the open side shut.
        Tips: Use a mix of fabrics for a patchwork look.
    2. DIY Rag Rug
    Materials Needed: Old T-shirts or fabric scraps, scissors, a non-slip rug mat.
    Steps:
        Cut Strips: Cut T-shirts or fabric scraps into long strips.
        Knot the Strips: Knot the strips onto the rug mat using a latch hook technique.
        Fill the Rug: Continue until the mat is covered.
        Tips: Use a variety of colors for a vibrant look.
    3. Upcycled Wall Art
    Materials Needed: Old magazines or newspapers, glue, scissors, a canvas or cardboard.
    Steps:
        Create Rolled Paper Art: Cut paper into strips, roll into coils, and glue the end.
        Arrange Coils: Glue coils onto the canvas or cardboard in a pattern.
        Tips: Use colors and textures to create visually appealing designs.
    4. Wine Cork Coasters
    Materials Needed: Wine corks, glue, a sharp knife.
    Steps:
        Cut Corks: Slice wine corks into even pieces.
        Arrange and Glue: Arrange pieces in a circular pattern and glue them together.
        Tips: Use corks from memorable occasions for a personalized touch.
    5. Tin Can Planters
    Materials Needed: Empty tin cans, paint, scrap fabric, soil, and plants.
    Steps:
        Clean and Paint Cans: Clean the cans and paint them or wrap with fabric.
        Plant: Fill cans with soil and plant your chosen greenery.
        Tips: Use herbs or small succulents for easy maintenance.
    Helpful Resources:
        One Home Therapy provides various eco-friendly decor ideas using sustainable materials.
        Edvigo Academy offers creative DIY home decor ideas using recycled materials.
        Martha Stewart suggests numerous craft projects with recycled materials.
        Paper and Stitch Blog shares eco-friendly project ideas to reduce waste."
}

Example 2:
{
    "score": 80,
    "Current Style": "The living room exhibits a contemporary design with a well-coordinated color scheme. It features sleek furniture, a balanced layout, and tasteful decorative elements. The space feels inviting and harmonious, with a good mix of textures and materials.",
    "Improvement Suggestions": "1. Add a statement art piece: Introduce a large, eye-catching artwork to create a focal point and inject personality. 2. Enhance lighting: Incorporate layered lighting with a mix of ambient, task, and accent lights to create depth and mood. 3. Introduce natural elements: Bring in indoor plants or natural wood accents to add warmth and organic texture to the space.",
    "Eco-Friendly Home Decor Ideas": "1. Vintage Book Planter: Transform old hardcover books into unique planters. Materials: Old hardcover books, utility knife, plastic liner, soil, succulents. Steps: Hollow out book pages, insert plastic liner, add soil and plants. Tutorial: https://www.apartmenttherapy.com/how-to-make-a-book-planter-234719 2. Repurposed Window Frame Mirror: Convert an old window frame into a decorative mirror. Materials: Old window frame, mirror glass, adhesive. Steps: Clean frame, cut mirror to fit, attach mirror to frame. Guide: https://www.bobvila.com/articles/diy-mirror-frame/ 3. Eco-friendly Wall Hanging: Create a wall hanging using natural materials. Materials: Driftwood or branch, yarn, beads. Steps: Wrap yarn around branch, create hanging strands with knots and beads. Instructions: https://www.ehow.com/how_7694461_make-driftwood-wall-hanging.html"
}

Example 3:
{ 
    "score": 70,
    "Current Style": "The room displays a casual contemporary style with a neutral color palette. It features basic furnishings and shows some attempt at cohesion, but lacks depth and personal touches. The overall look is pleasant but somewhat generic.",
    "Improvement Suggestions": "1. Add texture: Incorporate various textures through throw pillows, area rugs, and window treatments to add visual interest and depth. 2. Introduce accent colors: Use artwork, decorative objects, or textiles to bring in pops of color that complement the existing neutral tones. 3. Personalize the space: Display personal items, family photos, or unique collectibles to give the room more character and reflect the occupants' personality.",
    "Eco-Friendly Home Decor Ideas": "1. Upcycled Pallet Coffee Table: Create a rustic coffee table from a wooden pallet. Materials: Wooden pallet, sandpaper, wood stain, casters. Steps: Sand pallet, apply stain, attach casters. Tutorial: https://www.bobvila.com/articles/diy-pallet-coffee-table/ 2. Mason Jar Wall Sconces: Transform mason jars into charming wall-mounted lights. Materials: Mason jars, pipe clamps, wooden board, candles or LED lights. Steps: Attach jars to board using pipe clamps, add lighting. Guide: https://www.countryliving.com/diy-crafts/how-to/g3388/mason-jar-crafts/ 3. Fabric Scrap Throw Pillow: Make decorative pillows from fabric scraps. Materials: Fabric scraps, sewing machine, pillow stuffing. Steps: Sew fabric pieces together, create pillow cover, stuff and close. Instructions: https://www.thesprucecrafts.com/make-patchwork-throw-pillows-2978070"
}

Example 4:
{
    "score": 60,
    "Current Style": "The space has a basic, somewhat disjointed appearance. There's a mix of furniture styles without a clear theme, and the room lacks a cohesive color scheme. The overall impression is that of a space in transition, with potential for improvement.",
    "Improvement Suggestions": "1. Define a color scheme: Choose a consistent palette to tie the room together and guide future purchases. 2. Create a focal point: Add a statement piece like a large artwork or an eye-catching furniture item to anchor the room. 3. Improve furniture arrangement: Rearrange furniture to create better flow and define functional areas within the space.",
    "Eco-Friendly Home Decor Ideas": "1. Recycled Bottle Vases: Transform glass bottles into elegant vases. Materials: Glass bottles, spray paint, twine. Steps: Clean bottles, spray paint, wrap with twine for added texture. Tutorial: https://www.goodhousekeeping.com/home/craft-ideas/how-to/g139/bottle-crafts-0409/ 2. Cardboard Box Storage Ottomans: Convert sturdy cardboard boxes into functional storage ottomans. Materials: Cardboard boxes, fabric, foam padding, glue. Steps: Cover boxes with padding and fabric, add a lid. Guide: https://www.hgtv.com/design/make-and-celebrate/handmade/how-to-make-an-ottoman-from-a-cardboard-box 3. Tin Can Herb Garden: Create a vertical herb garden using tin cans. Materials: Tin cans, paint, soil, herbs, mounting materials. Steps: Paint cans, drill drainage holes, mount, plant herbs. Instructions: https://www.gardenersworld.com/how-to/diy/how-to-make-a-vertical-garden-for-herbs/"
}

Example 5:
{
    "score": 50,
    "Current Style": "The room appears unfinished and lacks a coherent style. Furniture placement seems random, and there's a noticeable absence of decorative elements and personal touches. The space feels bare and uninviting, with little attention to design principles.",
    "Improvement Suggestions": "1. Establish a layout: Rearrange furniture to create conversation areas and improve flow throughout the space. 2. Add soft furnishings: Introduce curtains, rugs, and throw pillows to soften the space and add comfort and color. 3. Incorporate wall decor: Hang artwork, mirrors, or shelving to fill empty wall spaces and add visual interest.",
    "Eco-Friendly Home Decor Ideas": "1. Pallet Wood Wall Art: Create a rustic wall piece using reclaimed pallet wood. Materials: Pallet wood, sandpaper, paint or stain, nails. Steps: Disassemble pallet, arrange wood pieces, paint or stain, mount on wall. Tutorial: https://www.thesprucecrafts.com/pallet-projects-for-the-home-4138372 2. T-shirt Yarn Rug: Turn old t-shirts into a unique area rug. Materials: Old t-shirts, large crochet hook or loom. Steps: Cut t-shirts into strips, join strips, crochet or weave into a rug. Guide: https://www.instructables.com/T-Shirt-Rug/ 3. Wine Cork Board: Make a functional bulletin board from wine corks. Materials: Wine corks, picture frame, glue. Steps: Arrange corks in frame, glue in place. Instructions: https://www.hgtv.com/design/make-and-celebrate/handmade/how-to-make-a-cork-bulletin-board"
}

Example 6:
{
    "score": 40,
    "Current Style": "The space appears neglected and poorly planned. There's a lack of essential furniture, and what's present seems mismatched and poorly maintained. The room lacks any discernible style or theme, giving an impression of disorganization and neglect.",
    "Improvement Suggestions": "1. Invest in key pieces: Add essential furniture items like a proper sofa, coffee table, and storage units to establish basic functionality. 2. Implement a color scheme: Choose a simple color palette to guide your design choices and create visual cohesion. 3. Deep clean and organize: Thoroughly clean the space and organize existing items to create a fresh canvas for improvements.",
    "Eco-Friendly Home Decor Ideas": "1. Cardboard Box Shelving: Create modular shelving units from sturdy cardboard boxes. Materials: Cardboard boxes, glue, paint or contact paper. Steps: Reinforce boxes, decorate exterior, stack and secure. Tutorial: https://www.1001pallets.com/cardboard-shelves/ 2. Plastic Bottle Vertical Garden: Turn plastic bottles into hanging planters. Materials: Plastic bottles, rope, soil, small plants. Steps: Cut bottles, drill holes, thread rope, fill with soil and plants. Guide: https://www.gardeningknowhow.com/special/containers/plastic-bottle-vertical-garden.htm 3. Newspaper Basket: Weave old newspapers into a decorative basket. Materials: Newspapers, glue, paint. Steps: Roll newspaper into tubes, weave into basket shape, paint or varnish. Instructions: https://www.thesprucecrafts.com/weave-a-basket-from-newspaper-4125743"
}

Example 7:
{
    "score": 30,
    "Current Style": "The room is nearly empty and lacks any discernible style. It appears uninhabited, with bare essentials and no attention to design or comfort. The space feels cold and unwelcoming, with bare walls and minimal furniture.",
    "Improvement Suggestions": "1. Start with a plan: Create a mood board to guide your design choices and establish a cohesive look for the space. 2. Focus on functionality: Introduce basic furniture pieces that serve essential functions like seating, storage, and lighting. 3. Add warmth and texture: Use textiles like area rugs, curtains, and throw blankets to make the space feel more inviting and comfortable.",
    "Eco-Friendly Home Decor Ideas": "1. Repurposed Ladder Bookshelf: Transform an old wooden ladder into a unique bookshelf. Materials: Wooden ladder, wood planks, paint or varnish. Steps: Clean ladder, attach planks for shelves, paint or varnish. Tutorial: https://www.bobvila.com/articles/ladder-shelf/ 2. Fabric Scrap Wall Hanging: Create a colorful wall hanging from fabric scraps. Materials: Fabric scraps, wooden dowel, yarn. Steps: Cut fabric into strips, tie onto dowel, arrange in pattern. Guide: https://www.abeautifulmess.com/make-your-own-woven-wall-hanging/ 3. Glass Jar Luminaries: Turn old glass jars into charming light fixtures. Materials: Glass jars, wire, candles or battery-operated lights. Steps: Clean jars, wrap with wire, add lighting element. Instructions: https://www.countryliving.com/diy-crafts/how-to/g2388/mason-jar-crafts/"
}
'''

response = model.generate_content([prompt, image])
response.resolve()

# print(response.text)
print(json.loads(response.text))