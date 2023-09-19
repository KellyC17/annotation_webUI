const lst = ['human_is_at(<LOC>)', 'human_is_near(<LOC>)', 'human_is_holding(<A>)', 'human_is_touching(<A>)', 'is_on_top_of(<A>, <B>)', 'is_underneath(<A>, <B>)', 'is_left_of(<A>, <B>)', 'is_right_of(<A>, <B>)', 'is_in_front_of(<A>, <B>)', 'is_behind(<A>, <B>)', 'is_inside(<A>, <B>)', 'is_on(<A>)', "is_on('tap_1')", 'is_off(<A>)', 'is_open(<A>)', 'is_closed(<A>)', 'is_empty(<A>)', 'is_filled_with(<A>, <B>)', 'is_cut(<A>)', 'is_cooked(<A>)', 'is_at(<A>, <LOC>)', 'is_near(<A>, <LOC>)', '']


export const dictionary = lst.map((item) => ({ value: item }))

