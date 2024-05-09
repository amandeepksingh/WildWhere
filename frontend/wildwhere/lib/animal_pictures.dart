

class AnimalPictures {
  static final AnimalPictures _instance = AnimalPictures._internal();

  factory AnimalPictures() {
    return _instance;
  }

  AnimalPictures._internal();

  Map<String, String> animalPictures(){
    return {
      'American Black Bear': 'assets/images/animals/american_black_bear.png',
      'Canada Lynx': 'assets/images/animals/canada_lynx.png',
      'Bobcat': 'assets/images/animals/bobcat.png',
      'White-Tailed Deer': 'assets/images/animals/white_tailed_deer.png',
      'Moose': 'assets/images/animals/moose.png',
      'American Beaver': 'assets/images/animals/american_beaver.png',
      'Eastern Coyote': 'assets/images/animals/eastern_coyote.png',
      'Red Fox': 'assets/images/animals/red_fox.png',
      'Gray Fox': 'assets/images/animals/gray_fox.png',
      'Eastern Cottontail': 'assets/images/animals/eastern_cottontail.png',
      'New England Cottontail': 'assets/images/animals/new_england_cottontail.png',
      'Snowshoe Hare': 'assets/images/animals/snowshoe_hare.png',
      'European Hare': 'assets/images/animals/european_hare.png',
      'Black-tailed Jackrabbit': 'assets/images/animals/black_tailed_jackrabbit.png',
      'North American Porcupine': 'assets/images/animals/north_american_porcupine.png',
      'Virginia Opossum': 'assets/images/animals/virginia_opossum.png',
      'Hairy-tailed Mole': 'assets/images/animals/hairy_tailed_mole.png',
      'Eastern Mole': 'assets/images/animals/eastern_mole.png',
      'Star-nosed Mole': 'assets/images/animals/star_nosed_mole.png',
      'Common Raccoon': 'assets/images/animals/raccoon.png',
      'Striped Skunk': 'assets/images/animals/striped_skunk.png',
      'American Marten': 'assets/images/animals/american_marten.png',
      'Fisher': 'assets/images/animals/fisher.png',
      'Short-tailed Weasel': 'assets/images/animals/short_tailed_weasel.png',
      'Long-tailed Weasel': 'assets/images/animals/long_tailed_weasel.png',
      'American Mink': 'assets/images/animals/american_mink.png',
      'River Otter': 'assets/images/animals/river_otter.png',
      'Eastern Chipmunk': 'assets/images/animals/eastern_chipmunk.png',
      'Woodchuck': 'assets/images/animals/woodchuck.png',
      'Eastern Gray Squirrel': 'assets/images/animals/eastern_gray_squirrel.png',
      'American Red Squirrel': 'assets/images/animals/american_red_squirrel.png',
      'Northern Flying Squirrel': 'assets/images/animals/northern_flying_squirrel.png',
      'Southern Flying Squirrel': 'assets/images/animals/southern_flying_squirrel.png',
      'Eastern Small-footed Myotis': 'assets/images/animals/eastern_small_footed_myotis.png',
      'Little Brown Myotis': 'assets/images/animals/little_brown_myotis.png',
      'Northern Long-eared Bat': 'assets/images/animals/northern_long_eared_bat.png', 
      'Indiana Myotis': 'assets/images/animals/indiana_myotis.png', 
      'Silver-haired Bat': 'assets/images/animals/silver_haired_bat.png', 
      'Eastern Pipistrelle': 'assets/images/animals/eastern_pipistrelle.png', 
      'Red Bat': 'assets/images/animals/red_bat.png', 
      'Hoary Bat': 'assets/images/animals/hoary_bat.png',
      'Meadow Jumping Mouse': 'assets/images/animals/meadow_jumping_mouse.png',
      'Woodland Jumping Mouse': 'assets/images/animals/woodland_jumping_mouse.png',
    };
  }
}